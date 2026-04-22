const Room = require("../models/Room");

const NO_API_AI_MODE = String(process.env.NO_API_AI_MODE || "true").toLowerCase() === "true";
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1:8b";
const AI_RATE_LIMIT_WINDOW_MS = Number(process.env.AI_RATE_LIMIT_WINDOW_MS || 18_000_000); // 5 hours
const AI_RATE_LIMIT_MAX = Number(process.env.AI_RATE_LIMIT_MAX || 10);

const SECURITY_RISK_PATTERNS = [
  /sql\s*injection|\bsqli\b/i,
  /\bxss\b|cross\s*site\s*scripting/i,
  /csrf|cross\s*site\s*request\s*forgery/i,
  /exploit|payload|bypass|privilege\s*escalation/i,
  /hack|hacking|crack|ddos|bruteforce|brute\s*force/i,
  /phishing|malware|ransomware|backdoor|keylogger/i,
  /steal\s+data|dump\s+db|dump\s+database|token\s*theft/i,
];

const rateLimitStore = new Map();

function getClientKey(req) {
  if (req.userId) return `user:${req.userId}`;
  const ip = req.ip || req.connection?.remoteAddress || "unknown";
  return `ip:${ip}`;
}

function applyRateLimit(key) {
  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing || now > existing.resetAt) {
    const resetAt = now + AI_RATE_LIMIT_WINDOW_MS;
    rateLimitStore.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: AI_RATE_LIMIT_MAX - 1, resetAt };
  }

  if (existing.count >= AI_RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  rateLimitStore.set(key, existing);
  return { allowed: true, remaining: AI_RATE_LIMIT_MAX - existing.count, resetAt: existing.resetAt };
}

function averageRating(room) {
  const ratings = room.ratingHistory || [];
  if (!ratings.length) return 0;
  const sum = ratings.reduce((acc, r) => acc + Number(r.rating || 0), 0);
  return sum / ratings.length;
}

function getRoomScore(room, userText) {
  const text = String(userText || "").toLowerCase();
  const cityMatch = text.includes(String(room.roomCity || "").toLowerCase()) ? 1 : 0;
  const rating = averageRating(room);
  const invPrice = room.price ? 1 / Number(room.price) : 0;
  const recency = room.createdAt ? new Date(room.createdAt).getTime() / 1e13 : 0;

  return cityMatch * 100 + rating * 10 + invPrice * 1000 + recency;
}

function buildRoomSnippet(rooms) {
  if (!rooms.length) return "No verified and available rooms found in the system right now.";

  return rooms
    .slice(0, 6)
    .map((r, idx) => {
      const avg = averageRating(r);
      return `${idx + 1}. ${r.roomType} in ${r.roomCity} | Price: LKR ${Number(r.price || 0).toLocaleString()} | Rating: ${avg.toFixed(1)} | Address: ${r.roomAddress}`;
    })
    .join("\\n");
}

function isSecurityRiskPrompt(text) {
  const input = String(text || "");
  return SECURITY_RISK_PATTERNS.some((pattern) => pattern.test(input));
}

function buildSecurityWarningReply() {
  return [
    "Security warning: I cannot help with exploitation or attack instructions.",
    "",
    "If you suspect a vulnerability in BirdNest, use this safe process:",
    "1. Stop and do not test destructive payloads.",
    "2. Record what you observed (URL, time, request/response, screenshots).",
    "3. Report it to your admin/developer team immediately.",
    "4. Apply fixes: input validation, output encoding, auth checks, rate limits, and patch dependencies.",
    "5. Re-test safely in a staging environment.",
  ].join("\\n");
}

function isRoomSearchIntent(text) {
  const input = String(text || "").toLowerCase();
  return /(room|boarding|accommodation|area|location|colombo|kandy|price|budget|available|listing|board|rent)/i.test(
    input
  );
}

function normalizeForMatch(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractNumbers(text) {
  return String(text || "")
    .match(/[\d,]+/g)
    ?.map((n) => Number(String(n).replace(/,/g, "")))
    .filter((n) => Number.isFinite(n)) || [];
}

function extractBudgetCriteria(text) {
  const input = String(text || "");
  const normalized = normalizeForMatch(input);

  const betweenMatch = normalized.match(
    /(?:between|from)\s*(?:rs|lkr)?\s*([\d,]+)\s*(?:and|to|-)\s*(?:rs|lkr)?\s*([\d,]+)/i
  );
  if (betweenMatch) {
    const first = Number(String(betweenMatch[1] || "").replace(/,/g, ""));
    const second = Number(String(betweenMatch[2] || "").replace(/,/g, ""));
    if (Number.isFinite(first) && Number.isFinite(second)) {
      return { min: Math.min(first, second), max: Math.max(first, second) };
    }
  }

  const underMatch = normalized.match(/(?:under|below|less than|up to|max|maximum)\s*(?:rs|lkr)?\s*([\d,]+)/i);
  if (underMatch) {
    const max = Number(String(underMatch[1] || "").replace(/,/g, ""));
    if (Number.isFinite(max)) return { min: null, max };
  }

  const overMatch = normalized.match(/(?:over|above|more than|min|minimum|at least)\s*(?:rs|lkr)?\s*([\d,]+)/i);
  if (overMatch) {
    const min = Number(String(overMatch[1] || "").replace(/,/g, ""));
    if (Number.isFinite(min)) return { min, max: null };
  }

  const numbers = extractNumbers(normalized);
  if (numbers.length >= 2) {
    return { min: Math.min(numbers[0], numbers[1]), max: Math.max(numbers[0], numbers[1]) };
  }
  if (numbers.length === 1 && /(budget|price|lkr|rs)/i.test(normalized)) {
    return { min: null, max: numbers[0] };
  }

  return { min: null, max: null };
}

function detectRequestedCity(text, rooms) {
  const input = normalizeForMatch(text);
  const cities = [...new Set((rooms || []).map((r) => String(r.roomCity || "").trim()).filter(Boolean))]
    .sort((a, b) => b.length - a.length);

  const cityLookup = new Map(cities.map((c) => [normalizeForMatch(c), c]));

  const areaAliases = {
    colombo: ["colombo", "wellawatte", "dehiwala", "mt lavinia", "mount lavinia", "bambalapitiya", "narahenpita", "rajagiriya", "nugegoda", "maharagama", "kirulapone", "dematagoda"],
    kandy: ["kandy", "peradeniya", "katugastota"],
    galle: ["galle", "hikkaduwa", "unawatuna"],
    kurunegala: ["kurunegala"],
    jaffna: ["jaffna", "yalpanam"],
    negombo: ["negombo"],
  };

  for (const [canonical, aliases] of Object.entries(areaAliases)) {
    if (aliases.some((alias) => input.includes(normalizeForMatch(alias))) && cityLookup.has(canonical)) {
      return cityLookup.get(canonical);
    }
  }

  for (const city of cities) {
    if (input.includes(normalizeForMatch(city))) return city;
  }

  return null;
}

function detectSortPreference(text) {
  const input = normalizeForMatch(text);
  if (/(cheapest|lowest price|low price|budget first|price low to high)/i.test(input)) return "price_asc";
  if (/(expensive|highest price|price high to low|premium first)/i.test(input)) return "price_desc";
  if (/(best rated|top rated|highest rated|rating)/i.test(input)) return "rating_desc";
  if (/(latest|newest|recent|just listed)/i.test(input)) return "latest";
  if (/(oldest|earliest)/i.test(input)) return "oldest";
  return "smart";
}

function budgetLabel(budget) {
  if (!budget || (!budget.min && !budget.max)) return "";
  if (budget.min && budget.max) {
    return `between LKR ${Number(budget.min).toLocaleString()} and LKR ${Number(budget.max).toLocaleString()}`;
  }
  if (budget.max) return `under LKR ${Number(budget.max).toLocaleString()}`;
  return `above LKR ${Number(budget.min).toLocaleString()}`;
}

function buildDetailedRoomReply(rooms, { city, budget }) {
  if (!rooms.length) {
    const cityText = city ? ` in ${city}` : "";
    const budgetText = budgetLabel(budget) ? ` ${budgetLabel(budget)}` : "";
    return `I could not find available verified rooms${cityText}${budgetText}. Try another area or increase your budget.`;
  }

  const titleParts = ["Here are the matching available rooms"];
  if (city) titleParts.push(`in ${city}`);
  if (budgetLabel(budget)) titleParts.push(budgetLabel(budget));

  const header = `${titleParts.join(" ")}:`;

  const lines = rooms.slice(0, 6).map((room, idx) => {
    const avg = averageRating(room);
    const date = room.createdAt ? new Date(room.createdAt).toLocaleDateString() : "N/A";
    return [
      `${idx + 1}) ${room.roomType || "Room"} - ${room.roomCity}`,
      `   Price: LKR ${Number(room.price || 0).toLocaleString()}`,
      `   Address: ${room.roomAddress || "N/A"}`,
      `   Rating: ${avg.toFixed(1)}`,
      `   Listed: ${date}`,
    ].join("\\n");
  });

  return [header, ...lines].join("\\n\\n");
}

async function callOllama(prompt) {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      options: {
        temperature: 0.5,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed with status ${response.status}`);
  }

  const data = await response.json();
  return String(data.response || "").trim();
}

exports.chatWithAssistant = async (req, res) => {
  try {
    const { message, history = [] } = req.body || {};

    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: "Message is required." });
    }

    const key = getClientKey(req);
    const limit = applyRateLimit(key);

    if (!limit.allowed) {
      return res.status(429).json({
        error: "Message limit reached. Please try again later.",
        resetAt: limit.resetAt,
      });
    }

    if (!NO_API_AI_MODE) {
      return res.status(400).json({ error: "This server is configured for NO_API_AI_MODE only." });
    }

    if (isSecurityRiskPrompt(message)) {
      return res.json({
        reply: buildSecurityWarningReply(),
        remaining: limit.remaining,
        resetAt: limit.resetAt,
        mode: "NO_API_AI_MODE",
        model: OLLAMA_MODEL,
        safety: "security_warning",
      });
    }

    const rooms = await Room.find({ isVerified: true, isBooked: { $ne: true }, rejected: { $ne: true } })
      .select("roomType roomCity roomAddress price ratingHistory createdAt")
      .lean();

    if (isRoomSearchIntent(message)) {
      const requestedCity = detectRequestedCity(message, rooms);
      const requestedBudget = extractBudgetCriteria(message);
      const sortPreference = detectSortPreference(message);

      let filtered = [...rooms];

      if (requestedCity) {
        filtered = filtered.filter(
          (r) => String(r.roomCity || "").toLowerCase() === String(requestedCity).toLowerCase()
        );
      }

      if (requestedBudget.min) {
        filtered = filtered.filter((r) => Number(r.price || 0) >= requestedBudget.min);
      }

      if (requestedBudget.max) {
        filtered = filtered.filter((r) => Number(r.price || 0) <= requestedBudget.max);
      }

      filtered.sort((a, b) => {
        const cityBoostA = requestedCity && String(a.roomCity || "").toLowerCase() === String(requestedCity).toLowerCase() ? 1 : 0;
        const cityBoostB = requestedCity && String(b.roomCity || "").toLowerCase() === String(requestedCity).toLowerCase() ? 1 : 0;
        if (cityBoostA !== cityBoostB) return cityBoostB - cityBoostA;

        if (sortPreference === "price_asc") {
          return Number(a.price || 0) - Number(b.price || 0);
        }

        if (sortPreference === "price_desc") {
          return Number(b.price || 0) - Number(a.price || 0);
        }

        if (sortPreference === "latest") {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }

        if (sortPreference === "oldest") {
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        }

        const ratingDiff = averageRating(b) - averageRating(a);
        if (ratingDiff !== 0) return ratingDiff;

        if (sortPreference === "rating_desc") {
          return Number(a.price || 0) - Number(b.price || 0);
        }

        const priceDiff = Number(a.price || 0) - Number(b.price || 0);
        if (priceDiff !== 0) return priceDiff;

        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });

      return res.json({
        reply: buildDetailedRoomReply(filtered, { city: requestedCity, budget: requestedBudget }),
        remaining: limit.remaining,
        resetAt: limit.resetAt,
        mode: "NO_API_AI_MODE",
        model: OLLAMA_MODEL,
        source: "database",
      });
    }

    const ranked = [...rooms].sort((a, b) => getRoomScore(b, message) - getRoomScore(a, message));
    const roomContext = buildRoomSnippet(ranked);

    const shortHistory = Array.isArray(history) ? history.slice(-8) : [];
    const historyText = shortHistory
      .map((h) => `${h.role === "assistant" ? "Assistant" : "User"}: ${String(h.content || "")}`)
      .join("\\n");

    const prompt = `You are BirdNest Assistant.
Rules:
- Keep responses concise and helpful.
- Answer in English by default.
- If user asks Sinhala or Tamil, respond in that language.
- Focus on accommodation help, recommendations, and app guidance.
- If user asks hacking/exploit/security attack content, refuse and provide only defensive best practices.
- Do not mention training data.
- If data is missing, say you are not sure.

Available room data:
${roomContext}

Conversation:
${historyText}
User: ${String(message).trim()}
Assistant:`;

    const reply = await callOllama(prompt);

    return res.json({
      reply: reply || "I could not generate a response right now.",
      remaining: limit.remaining,
      resetAt: limit.resetAt,
      mode: "NO_API_AI_MODE",
      model: OLLAMA_MODEL,
    });
  } catch (error) {
    return res.status(503).json({
      error: "Assistant is temporarily unavailable.",
      detail: error.message,
    });
  }
};
