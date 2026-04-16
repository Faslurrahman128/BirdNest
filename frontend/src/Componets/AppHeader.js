import React from "react";
import logo from "./assets/APPLOGO.png";
import ramadanMoon from "../assets/ramadan-moon.jpg";
import ramadanLantern from "../assets/ramadan-lantern.jpg";
import fireworkIcon from "../assets/firework-icon.png";
import pongalImg from "../assets/thaipongal.png";
import capAsset from '../assets/cap.png';
import giftAsset from '../assets/gift.png';
import treeAsset from '../assets/tree.png';
import { useTheme, THEMES } from "../ThemeContext";
import "./CSS/AppHeader.css";
import { useNavigate } from "react-router-dom";

const AppHeader = ({
  appName = "Bird Nest",
  tagline = "Administration Made Powerful",
  showLogout = false,
  onLogout = null
}) => {
  const navigate = useNavigate();

  // Check if user is logged in (either through props or sessionStorage)
  const isLoggedIn = showLogout || !!sessionStorage.getItem("token");

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      sessionStorage.removeItem("token");
      navigate("/StaffLogin", { replace: true });
    }
  };

  const { theme } = useTheme();
  const showCap = theme === THEMES.CHRISTMAS;
  const showGift = theme === THEMES.CHRISTMAS;
  const showTree = theme === THEMES.CHRISTMAS;

  return (
    <header className="admin-glass-header admin-glass-header-left">
        <div className="admin-glass-header-content-left" style={{ position: 'relative' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img src={logo} alt="LOGO" className="admin-glass-logo" />
            {showCap && (
              <img src={capAsset} alt="Christmas Cap" className="cap-on-logo" />
            )}
            {/* Ramadan Lantern under logo, only in Ramadan theme */}
            {theme === THEMES.RAMADAN && (
              <img
                src={ramadanLantern}
                alt="Ramadan Lantern"
                style={{
                  width: 32,
                  height: 38,
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  top: '100%',
                  marginTop: '10px',
                  zIndex: 21
                }}
              />
            )}
          </div>
          <div className="admin-glass-header-title" style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', justifyContent: 'center' }}>
              <span
                className="admin-glass-app-name"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  marginTop: '14px',
                  position: 'relative'
                }}
              >
                {appName}
                {/* Ramadan Moon only in Ramadan theme */}
                {theme === THEMES.RAMADAN && (
                  <img
                    src={ramadanMoon}
                    alt="Ramadan Moon"
                    style={{
                      width: 32,
                      height: 32,
                      marginLeft: 8,
                      position: 'relative',
                      zIndex: 22
                    }}
                  />
                )}
              {/* Seasonal icons placed horizontally together next to the App Name */}
              <div 
                style={{
                  position: 'absolute',
                  left: '100%',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  marginTop: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginLeft: '14px',
                  zIndex: 22
                }}
              >
                {theme === THEMES.NEWYEAR && (
                  <img src={fireworkIcon} alt="New Year Firework" style={{ width: 56, height: 56 }} />
                )}
                {theme === THEMES.PONGAL && (
                  <img src={pongalImg} alt="Pongal" style={{ width: 68, height: 68, position: 'relative', top: '-6px' }} />
                )}
                {showTree && (
                  <img src={treeAsset} alt="Tree" style={{ width: 50, height: 50, objectFit: 'contain', filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.2))' }} />
                )}
                {showGift && (
                  <img src={giftAsset} alt="Gift" style={{ width: 54, height: 54, objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }} />
                )}
              </div>
            </span>
            <span
              className="admin-glass-tagline"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                position: 'relative',
                marginTop: '2px'
              }}
            >
              {tagline}
            </span>
          </div>
        </div>
        </div>
        <div className="admin-glass-header-content-right">
          {/* Logout button removed as requested */}
        </div>
      </header>
  );
};

export default AppHeader;