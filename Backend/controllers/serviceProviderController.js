const ServiceProvider = require("../models/serviceProvider");

// Register a new service provider
exports.registerServiceProvider = async (req, res) => {
  try {
    const { name, email, phoneNumber, serviceArea, serviceType, description } = req.body;

    // Check if email already exists
    const existingProvider = await ServiceProvider.findOne({ email });
    if (existingProvider) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    
    // Create new service provider
    const newProvider = new ServiceProvider({
      name,
      email,
      phoneNumber,
      serviceArea,
      serviceType,
      description,
    });

    await newProvider.save();
    res.status(201).json({ message: "Service provider registered successfully!" });

  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all service providers
exports.getAllServiceProviders = async (req, res) => {
  try {
    const providers = await ServiceProvider.find();
    res.json(providers);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get a single service provider by ID
exports.getServiceProviderById = async (req, res) => {
  try {
    const provider = await ServiceProvider.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ error: "Service Provider not found" });
    }
    res.json(provider);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update service provider details
exports.updateServiceProvider = async (req, res) => {
  try {
    const updatedProvider = await ServiceProvider.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProvider) {
      return res.status(404).json({ error: "Service Provider not found" });
    }
    res.json({ message: "Service Provider updated successfully", updatedProvider });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete a service provider
exports.deleteServiceProvider = async (req, res) => {
  try {
    const deletedProvider = await ServiceProvider.findByIdAndDelete(req.params.id);
    if (!deletedProvider) {
      return res.status(404).json({ error: "Service Provider not found" });
    }
    res.json({ message: "Service Provider deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
