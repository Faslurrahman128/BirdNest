

import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AppHeader from "../Componets/AppHeader";
import { useTheme, THEMES } from "../ThemeContext";

import axios from "axios";
import "../Componets/CSS/admin-glass.css";
import "../Componets/CSS/Admindash.css";

const SEASONAL_GREETINGS = {
  [THEMES.RAMADAN]: "Ramadan Mubarak!",
  [THEMES.CHRISTMAS]: "Merry Christmas!",
  [THEMES.NEWYEAR]: "Happy New Year!",
  [THEMES.PONGAL]: "Happy Pongal!"
};

function StaffDashboard() {
  const { theme } = useTheme();
  const location = useLocation();
  const staffName = location.state?.message?.replace('Welcome, ', '').replace('!', '') || "Staff";

  const [verifiedRooms, setVerifiedRooms] = useState([]);
  const [unverifiedRooms, setUnverifiedRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = sessionStorage.getItem("token");

  // Fetch all rooms and split into verified/unverified
  const fetchRooms = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:8070/rooms");
      const rooms = res.data;
      setVerifiedRooms(rooms.filter(r => r.isVerified && !r.rejected));
      setUnverifiedRooms(rooms.filter(r => !r.isVerified && !r.rejected));
    } catch (err) {
      setError("Failed to fetch rooms");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Approve (verify) a room
  const handleApprove = async (roomId) => {
    try {
      setLoading(true);
      await axios.put(
        `http://localhost:8070/Room/verify/${roomId}`,
        { isVerified: true, rejected: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRooms();
    } catch (err) {
      setError("Failed to approve room");
    }
    setLoading(false);
  };

  // Reject a room
  const handleReject = async (roomId) => {
    try {
      setLoading(true);
      await axios.put(
        `http://localhost:8070/Room/verify/${roomId}`,
        { isVerified: false, rejected: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRooms();
    } catch (err) {
      setError("Failed to reject room");
    }
    setLoading(false);
  };

  return (
    <div className={`admin-glass-bg theme-${theme}`}> 
      <AppHeader appName="Bird Nest" tagline="Staff Dashboard" />
      <div className="admin-glass-center" style={{flexDirection:'column', alignItems:'stretch'}}>
        <div className="admin-glass-card" style={{maxWidth:700, margin:'0 auto', marginBottom:24}}>
          <h2 className="admin-glass-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            Welcome, {staffName}!
            {SEASONAL_GREETINGS[theme] && (
              <span className="staff-seasonal-badge" style={{ fontSize: '0.8rem', padding: '4px 10px', background: 'rgba(0, 48, 135, 0.1)', color: '#003087', borderRadius: '20px', fontWeight: '500' }}>
                {SEASONAL_GREETINGS[theme]}
              </span>
            )}
          </h2>
          <span className="admin-glass-subtitle">Manage and verify property listings below</span>
        </div>
        <div className="admin-glass-card" style={{maxWidth:1100, margin:'0 auto', marginBottom:32}}>
          <h3 style={{textAlign:'left', color:'#003087', marginBottom:16, fontWeight:600}}>Unverified Properties</h3>
          {loading ? <p>Loading...</p> : error ? <p style={{ color: 'red' }}>{error}</p> : (
            <div style={{overflowX:'auto'}}>
              <table className="table" style={{width:'100%', borderCollapse:'collapse', background:'rgba(255,255,255,0.9)', borderRadius:12}}>
                <thead style={{background:'#e0e7ef'}}>
                  <tr>
                    <th style={{padding:'12px 8px', fontWeight:600}}>Photo</th>
                    <th style={{padding:'12px 8px', fontWeight:600, color:'#888', fontSize:'0.95em'}}>Image URL (debug)</th>
                    <th style={{padding:'12px 8px', fontWeight:600}}>Property Name</th>
                    <th style={{padding:'12px 8px', fontWeight:600}}>Owner</th>
                    <th style={{padding:'12px 8px', fontWeight:600}}>City</th>
                    <th style={{padding:'12px 8px', fontWeight:600}}>Created</th>
                    <th style={{padding:'12px 8px', fontWeight:600}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {unverifiedRooms.length === 0 ? (
                    <tr><td colSpan={6} style={{textAlign:'center', color:'#888'}}>No unverified properties</td></tr>
                  ) : unverifiedRooms.map(room => (
                    <tr key={room._id} style={{borderBottom:'1px solid #e0e7ef'}}>
                      <td style={{padding:'10px 8px'}}>
                        {room.images && room.images.length > 0 ? (
                          <img
                            src={
                              room.images[0].startsWith('http')
                                ? room.images[0]
                                : `http://localhost:8070${room.images[0].startsWith('/') ? room.images[0] : '/uploads/' + room.images[0]}`
                            }
                            alt="room"
                            style={{width:70, height:50, objectFit:'cover', borderRadius:6, border:'1px solid #eee'}}
                            onError={e => { e.target.onerror=null; e.target.src='https://via.placeholder.com/70x50?text=No+Image'; }}
                          />
                        ) : (
                          <span style={{color:'#bbb'}}>No Image</span>
                        )}
                      </td>
                      <td style={{padding:'10px 8px', fontSize:'0.85em', color:'#888', wordBreak:'break-all'}}>
                        {room.images && room.images.length > 0 ? (
                          room.images[0].startsWith('http')
                            ? room.images[0]
                            : `http://localhost:8070${room.images[0].startsWith('/') ? room.images[0] : '/uploads/' + room.images[0]}`
                        ) : 'No Image'}
                      </td>
                      <td style={{padding:'10px 8px'}}>{room.roomAddress}</td>
                      <td style={{padding:'10px 8px'}}>{room.ownerName}</td>
                      <td style={{padding:'10px 8px'}}>{room.roomCity}</td>
                      <td style={{padding:'10px 8px'}}>{room.createdAt ? new Date(room.createdAt).toLocaleString() : '-'}</td>
                      <td style={{padding:'10px 8px'}}>
                        <button className="approve-btn" onClick={() => handleApprove(room._id)} style={{marginRight:8}}>Approve</button>
                        <button className="admin-glass-btn" onClick={() => handleReject(room._id)} style={{background:'#e74c3c', color:'#fff', border:'none', borderRadius:5, padding:'8px 16px'}}>Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="admin-glass-card" style={{maxWidth:1100, margin:'0 auto'}}>
          <h3 style={{textAlign:'left', color:'#003087', marginBottom:16, fontWeight:600}}>Verified Properties</h3>
          {loading ? <p>Loading...</p> : error ? <p style={{ color: 'red' }}>{error}</p> : (
            <div style={{overflowX:'auto'}}>
              <table className="table" style={{width:'100%', borderCollapse:'collapse', background:'rgba(255,255,255,0.9)', borderRadius:12}}>
                <thead style={{background:'#e0e7ef'}}>
                  <tr>
                    <th style={{padding:'12px 8px', fontWeight:600}}>Photo</th>
                    <th style={{padding:'12px 8px', fontWeight:600, color:'#888', fontSize:'0.95em'}}>Image URL (debug)</th>
                    <th style={{padding:'12px 8px', fontWeight:600}}>Property Name</th>
                    <th style={{padding:'12px 8px', fontWeight:600}}>Owner</th>
                    <th style={{padding:'12px 8px', fontWeight:600}}>City</th>
                    <th style={{padding:'12px 8px', fontWeight:600}}>Verified At</th>
                  </tr>
                </thead>
                <tbody>
                  {verifiedRooms.length === 0 ? (
                    <tr><td colSpan={5} style={{textAlign:'center', color:'#888'}}>No verified properties</td></tr>
                  ) : verifiedRooms.map(room => (
                    <tr key={room._id} style={{borderBottom:'1px solid #e0e7ef'}}>
                      <td style={{padding:'10px 8px'}}>
                        {room.images && room.images.length > 0 ? (
                          <img
                            src={
                              room.images[0].startsWith('http')
                                ? room.images[0]
                                : `http://localhost:8070${room.images[0].startsWith('/') ? room.images[0] : '/uploads/' + room.images[0]}`
                            }
                            alt="room"
                            style={{width:70, height:50, objectFit:'cover', borderRadius:6, border:'1px solid #eee'}}
                            onError={e => { e.target.onerror=null; e.target.src='https://via.placeholder.com/70x50?text=No+Image'; }}
                          />
                        ) : (
                          <span style={{color:'#bbb'}}>No Image</span>
                        )}
                      </td>
                      <td style={{padding:'10px 8px', fontSize:'0.85em', color:'#888', wordBreak:'break-all'}}>
                        {room.images && room.images.length > 0 ? (
                          room.images[0].startsWith('http')
                            ? room.images[0]
                            : `http://localhost:8070${room.images[0].startsWith('/') ? room.images[0] : '/uploads/' + room.images[0]}`
                        ) : 'No Image'}
                      </td>
                      <td style={{padding:'10px 8px'}}>{room.roomAddress}</td>
                      <td style={{padding:'10px 8px'}}>{room.ownerName}</td>
                      <td style={{padding:'10px 8px'}}>{room.roomCity}</td>
                      <td style={{padding:'10px 8px'}}>{room.verifiedAt ? new Date(room.verifiedAt).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StaffDashboard;
