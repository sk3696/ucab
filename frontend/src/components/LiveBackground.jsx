import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

// High-fidelity 3D-shaded Indian vehicle vectors (REAR view - traveling UP away from camera)
const VEHICLE_REAR = {
  // 1. Classic Indian Auto-Rickshaw Rear
  bike: (color) => (
    <div style={{ transform: 'scale(1.1)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="44" height="42" viewBox="0 0 44 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="34" width="6" height="8" rx="2" fill="#111" />
        <rect x="32" y="34" width="6" height="8" rx="2" fill="#111" />
        <rect x="10" y="35" width="24" height="3" fill="#333" />
        <rect x="4" y="16" width="36" height="19" rx="3" fill="#1b4332" stroke="#121829" strokeWidth="1" />
        <rect x="4" y="24" width="36" height="3" fill="#ffb300" />
        <path d="M6 6C6 3 10 1 22 1C34 1 38 3 38 6V16H6V6Z" fill="#ffca28" stroke="#f57f17" strokeWidth="1" />
        <rect x="10" y="7" width="24" height="7" rx="1.5" fill="#223" opacity="0.8" />
        <circle cx="8" cy="29" r="2.5" fill="#d32f2f" />
        <circle cx="36" cy="29" r="2.5" fill="#d32f2f" />
        <rect x="5" y="32" width="8" height="4" fill="#000" />
        <rect x="31" y="32" width="8" height="4" fill="#000" />
      </svg>
      <span style={{ fontSize: '6px', color: '#ffb300', fontWeight: 'bold', marginTop: '1px', background: '#000', padding: '0.5px 2px', borderRadius: '1px' }}>AUTO</span>
    </div>
  ),

  // 2. Rider on Scooty/Bike Rear
  scooty: (color) => (
    <div style={{ transform: 'scale(1.0)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="34" height="42" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="17" cy="6" r="5.5" fill="#0288d1" />
        <rect x="14" y="3" width="6" height="2" fill="#000" />
        <path d="M12 11.5C12 10.5 13 9 17 9C21 9 22 10.5 22 11.5L25 18H9L12 11.5Z" fill="#37474f" />
        <path d="M8 18C8 18 4 24 4 28C4 32 8 35 17 35C26 35 30 32 30 28C30 24 26 18 26 18H8Z" fill={color} stroke="#111" strokeWidth="1" />
        <rect x="14" y="34" width="6" height="8" rx="2.5" fill="#111" />
        <rect x="11" y="27" width="12" height="6" fill="#fff" stroke="#111" strokeWidth="0.5" />
        <rect x="14" y="29" width="6" height="2" fill="#000" />
        <path d="M13 20H21V23C21 23 19 25 17 25C15 25 13 23 13 23V20Z" fill="#ff1744" />
      </svg>
    </div>
  ),

  // 3. Decorated Tata Truck Rear (Horn OK Please!)
  mini: (color) => (
    <div style={{ transform: 'scale(1.25)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="56" height="52" viewBox="0 0 56 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="44" width="8" height="8" rx="2" fill="#111" />
        <rect x="42" y="44" width="8" height="8" rx="2" fill="#111" />
        <rect x="2" y="10" width="52" height="34" rx="2" fill="#8b5a2b" stroke="#4a2c0f" strokeWidth="1.5" />
        <rect x="2" y="12" width="52" height="4" fill="#ff9100" />
        <rect x="2" y="16" width="52" height="4" fill="#ffffff" />
        <rect x="2" y="20" width="52" height="4" fill="#4caf50" />
        <rect x="8" y="25" width="40" height="13" rx="2" fill="#ffb300" stroke="#d32f2f" strokeWidth="1" />
        <text x="11" y="34" fill="#d32f2f" fontSize="7" fontWeight="900" fontFamily="monospace" letterSpacing="1">HORN OK PLEASE</text>
        <rect x="18" y="2" width="20" height="8" fill="#1565c0" rx="1.5" />
        <text x="21" y="8" fill="#fff" fontSize="6" fontWeight="bold">TATA</text>
        <circle cx="8" cy="40" r="3" fill="#ff1744" />
        <circle cx="48" cy="40" r="3" fill="#ff1744" />
      </svg>
    </div>
  ),

  // 4. Maruti Suzuki Hatchback Rear
  economy: (color) => (
    <div style={{ transform: 'scale(1.2)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="48" height="40" viewBox="0 0 48 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="7" y="32" width="7" height="8" rx="2.5" fill="#111" />
        <rect x="34" y="32" width="7" height="8" rx="2.5" fill="#111" />
        <path d="M4 26C4 26 4 33 8 33H40C44 33 44 26 44 26V24H4V26Z" fill="#2d3748" />
        <path d="M4 24V14C4 11 8 8 16 8H32C40 8 44 11 44 14V24H4Z" fill={color} stroke="#111" strokeWidth="1" />
        <path d="M9 10C9 10 12 9 24 9C36 9 39 10 39 10L37 16H11L9 10Z" fill="#1a202c" opacity="0.9" />
        <rect x="5" y="20" width="6" height="5" rx="1" fill="#e53e3e" />
        <rect x="37" y="20" width="6" height="5" rx="1" fill="#e53e3e" />
        <path d="M23 19.5L25 17.5H23.5L22.5 19.5L24.5 19.5" stroke="#cbd5e0" strokeWidth="1" />
        <rect x="18" y="26" width="12" height="5" fill="#fff" rx="1" />
        <rect x="20" y="28" width="8" height="1" fill="#000" />
      </svg>
    </div>
  ),

  // 5. Mahindra SUV XL Rear
  xl: (color) => (
    <div style={{ transform: 'scale(1.3)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="52" height="46" viewBox="0 0 52 46" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="38" width="8" height="8" rx="2" fill="#111" />
        <rect x="38" y="38" width="8" height="8" rx="2" fill="#111" />
        <rect x="3" y="14" width="46" height="25" rx="2" fill={color} stroke="#111" strokeWidth="1" />
        <rect x="4" y="6" width="44" height="9" rx="1" fill="#1a202c" />
        <line x1="26" y1="11" x2="36" y2="7" stroke="#000" strokeWidth="1.5" />
        <circle cx="26" cy="25" r="8" fill="#111" />
        <circle cx="26" cy="25" r="5" fill="#718096" stroke="#4a5568" strokeWidth="1" />
        <rect x="3" y="16" width="3" height="12" fill="#e53e3e" />
        <rect x="46" y="16" width="3" height="12" fill="#e53e3e" />
        <rect x="21" y="35" width="10" height="4" fill="#ffeb3b" rx="0.5" />
        <rect x="23" y="36.5" width="6" height="1" fill="#000" />
      </svg>
    </div>
  )
};

// High-fidelity 3D-shaded Indian vehicle vectors (FRONT view - traveling DOWN towards camera)
const VEHICLE_FRONT = {
  // 1. Auto-Rickshaw Front
  bike: (color) => (
    <div style={{ transform: 'scale(1.1)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="44" height="42" viewBox="0 0 44 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="19" y="34" width="6" height="8" rx="2" fill="#111" /> {/* single front tyre */}
        <rect x="4" y="16" width="36" height="19" rx="3" fill="#1b4332" stroke="#121829" strokeWidth="1" />
        <rect x="4" y="24" width="36" height="3" fill="#ffb300" />
        <path d="M6 6C6 3 10 1 22 1C34 1 38 3 38 6V16H6V6Z" fill="#ffca28" stroke="#f57f17" strokeWidth="1" />
        {/* Large front windshield */}
        <path d="M8 8H36V15H8V8Z" fill="#a0aec0" opacity="0.65" />
        <line x1="22" y1="8" x2="18" y2="14" stroke="#000" strokeWidth="1.5" /> {/* Single wiper */}
        {/* Bright Glowing Headlights */}
        <circle cx="10" cy="28" r="4.5" fill="#fffde7" />
        <circle cx="10" cy="28" r="3.5" fill="#fffb3d" />
        <circle cx="34" cy="28" r="4.5" fill="#fffde7" />
        <circle cx="34" cy="28" r="3.5" fill="#fffb3d" />
      </svg>
    </div>
  ),

  // 2. Scooty/Bike Front
  scooty: (color) => (
    <div style={{ transform: 'scale(1.0)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="34" height="42" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="17" cy="6" r="5.5" fill="#0288d1" /> {/* Rider Helmet */}
        <rect x="12" y="5" width="10" height="2" fill="#000" /> {/* Front visor */}
        {/* Front Shield body */}
        <path d="M6 18C6 18 10 32 17 32C24 32 28 18 28 18H6Z" fill={color} stroke="#111" strokeWidth="1" />
        <rect x="14" y="32" width="6" height="10" rx="2" fill="#111" /> {/* Front wheel */}
        {/* Bright Center Headlight */}
        <circle cx="17" cy="21" r="4" fill="#fffb3d" />
        {/* Front Indicators */}
        <rect x="7" y="24" width="4" height="2" fill="#ff9100" />
        <rect x="23" y="24" width="4" height="2" fill="#ff9100" />
      </svg>
    </div>
  ),

  // 3. Tata Truck Front
  mini: (color) => (
    <div style={{ transform: 'scale(1.25)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="56" height="52" viewBox="0 0 56 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Front wheels */}
        <rect x="7" y="44" width="8" height="8" rx="2" fill="#111" />
        <rect x="41" y="44" width="8" height="8" rx="2" fill="#111" />
        {/* Large Front Cabin Body */}
        <rect x="4" y="8" width="48" height="36" rx="2" fill="#1e3a8a" stroke="#172554" strokeWidth="1" />
        {/* Windshield */}
        <rect x="7" y="11" width="42" height="14" fill="#93c5fd" opacity="0.7" />
        <line x1="20" y1="12" x2="16" y2="23" stroke="#000" strokeWidth="1.5" />
        <line x1="36" y1="12" x2="32" y2="23" stroke="#000" strokeWidth="1.5" />
        {/* Chrome Grille */}
        <rect x="14" y="28" width="28" height="10" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
        <line x1="18" y1="31" x2="38" y2="31" stroke="#475569" strokeWidth="1" />
        <line x1="18" y1="35" x2="38" y2="35" stroke="#475569" strokeWidth="1" />
        {/* Bright Headlights */}
        <circle cx="9" cy="33" r="4.5" fill="#fffb3d" />
        <circle cx="47" cy="33" r="4.5" fill="#fffb3d" />
      </svg>
    </div>
  ),

  // 4. Maruti Suzuki Hatchback Front
  economy: (color) => (
    <div style={{ transform: 'scale(1.2)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="48" height="40" viewBox="0 0 48 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Tyres */}
        <rect x="8" y="32" width="6" height="8" rx="2" fill="#111" />
        <rect x="34" y="32" width="6" height="8" rx="2" fill="#111" />
        {/* Main Body */}
        <path d="M4 22V14C4 11 8 8 16 8H32C40 8 44 11 44 14V22H4Z" fill={color} stroke="#111" strokeWidth="1" />
        {/* Windshield */}
        <path d="M8 10C8 10 12 9 24 9C36 9 40 10 40 10L37 16H11L8 10Z" fill="#1a202c" opacity="0.85" />
        {/* Bumper / Grille */}
        <rect x="4" y="22" width="40" height="10" fill="#1a202c" />
        <rect x="14" y="24" width="20" height="4" fill="#4a5568" rx="1" />
        {/* Headlights */}
        <path d="M5 22H11L9 26H5V22Z" fill="#fffde7" />
        <path d="M43 22H37L39 26H43V22Z" fill="#fffde7" />
        <circle cx="8" cy="24" r="2.5" fill="#fffb3d" />
        <circle cx="40" cy="24" r="2.5" fill="#fffb3d" />
      </svg>
    </div>
  ),

  // 5. Mahindra SUV XL Front
  xl: (color) => (
    <div style={{ transform: 'scale(1.3)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="52" height="46" viewBox="0 0 52 46" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="7" y="38" width="7" height="8" rx="2" fill="#111" />
        <rect x="38" y="38" width="7" height="8" rx="2" fill="#111" />
        {/* Tall SUV Body */}
        <rect x="3" y="12" width="46" height="26" rx="2" fill={color} stroke="#111" strokeWidth="1" />
        {/* windshield */}
        <rect x="6" y="14" width="40" height="12" fill="#2d3748" opacity="0.8" />
        {/* Vertical Grille */}
        <rect x="16" y="29" width="20" height="7" fill="#1a202c" rx="1" />
        <line x1="20" y1="29" x2="20" y2="36" stroke="#4a5568" strokeWidth="1" />
        <line x1="26" y1="29" x2="26" y2="36" stroke="#4a5568" strokeWidth="1" />
        <line x1="32" y1="29" x2="32" y2="36" stroke="#4a5568" strokeWidth="1" />
        {/* Square blocky Headlights */}
        <rect x="6" y="28" width="7" height="5" rx="1" fill="#fffde7" stroke="#4a5568" strokeWidth="0.5" />
        <circle cx="9.5" cy="30.5" r="2" fill="#fffb3d" />
        <rect x="39" y="28" width="7" height="5" rx="1" fill="#fffde7" stroke="#4a5568" strokeWidth="0.5" />
        <circle cx="42.5" cy="30.5" r="2" fill="#fffb3d" />
      </svg>
    </div>
  )
};

const RANDOM_COLORS = [
  '#e53e3e', '#3182ce', '#38a169', '#dd6b20', '#805ad5',
  '#319795', '#b7791f', '#4a5568', '#d69e2e', '#48bb78'
];

export const LiveBackground = ({ selectedType }) => {
  const { theme, language } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [stars, setStars] = useState([]);
  const [sceneryItems, setSceneryItems] = useState([]);
  
  const isDark = theme === 'dark';

  // Twinkling stars or cloud formations
  useEffect(() => {
    const list = [];
    for (let i = 0; i < 20; i++) {
      list.push({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 45}%`,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 2.5 + 0.8
      });
    }
    setStars(list);
  }, []);

  // Spawn perspective roadside elements (Overhead NHAI green signboards, coconut trees)
  useEffect(() => {
    const spawnScenery = () => {
      const id = `${Date.now()}-${Math.random()}`;
      const type = Math.random() > 0.4 ? 'coconut' : 'signboard';
      const side = Math.random() > 0.5 ? 'left' : 'right';
      const duration = 5 + Math.random() * 2;

      const newItem = { id, type, side, duration };
      setSceneryItems((prev) => [...prev, newItem]);

      setTimeout(() => {
        setSceneryItems((prev) => prev.filter((item) => item.id !== id));
      }, duration * 1000);
    };

    const interval = setInterval(spawnScenery, 3200);
    for (let i = 0; i < 3; i++) {
      setTimeout(spawnScenery, i * 1500);
    }

    return () => clearInterval(interval);
  }, []);

  // Spawn perspective vehicles (receding down the NH lanes in 3D)
  useEffect(() => {
    // 4 separate lanes on the Indian NH-16 Highway:
    // Left side traffic traveling UP (away from camera, rear view)
    // Right side traffic traveling DOWN (towards camera, front view)
    const activeLanes = [
      { id: 1, leftOffset: '33%', direction: 'up' },   // Left lane up
      { id: 2, leftOffset: '44%', direction: 'up' },   // Mid-Left lane up
      { id: 3, leftOffset: '56%', direction: 'down' }, // Mid-Right lane down
      { id: 4, leftOffset: '67%', direction: 'down' }  // Right lane down
    ];

    const spawnVehicle = () => {
      let type = selectedType;
      if (!type || Math.random() > 0.85) {
        const types = Object.keys(VEHICLE_REAR);
        type = types[Math.floor(Math.random() * types.length)];
      }

      const lane = activeLanes[Math.floor(Math.random() * activeLanes.length)];
      const color = RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)];
      const id = `${Date.now()}-${Math.random()}`;
      
      const duration = 4.5 + Math.random() * 1.5;

      const newVehicle = {
        id,
        type,
        lane,
        color,
        duration
      };

      setVehicles((prev) => [...prev, newVehicle]);

      setTimeout(() => {
        setVehicles((prev) => prev.filter((v) => v.id !== id));
      }, duration * 1000);
    };

    const spawnInterval = selectedType ? 850 : 2000;
    
    for (let i = 0; i < (selectedType ? 7 : 3); i++) {
      setTimeout(spawnVehicle, i * 450);
    }

    const timer = setInterval(spawnVehicle, spawnInterval);
    return () => clearInterval(timer);
  }, [selectedType]);

  return (
    <div 
      className="indian-highway-3d-bg" 
      style={{ 
        position: 'relative', 
        height: '240px', 
        width: '100%', 
        overflow: 'hidden',
        background: isDark 
          ? 'linear-gradient(to bottom, #010c1e 0%, #0c1a30 45%, #1a2a44 75%, #2d183d 95%)' 
          : 'linear-gradient(to bottom, #a0c4ff 0%, #b0d2ff 45%, #ffd6a5 75%, #ffadad 95%)',
        zIndex: 0
      }}
    >
      
      {/* 1. SKY ambient stars */}
      <div style={{ position: 'absolute', width: '100%', height: '110px', zIndex: 1 }}>
        {stars.map((star) => (
          <div
            key={star.id}
            style={{
              position: 'absolute',
              left: star.left,
              top: star.top,
              width: `${star.size}px`,
              height: `${star.size}px`,
              background: isDark ? '#fff' : 'rgba(255,255,255,0.7)',
              borderRadius: '50%',
              boxShadow: isDark ? '0 0 5px rgba(255,255,255,0.8)' : 'none',
              animation: `pulse ${star.speed}s infinite alternate`
            }}
          />
        ))}
      </div>

      {/* 2. NH-16 HORIZON SUNSET / GLOOM */}
      <div 
        style={{
          position: 'absolute',
          left: '50%',
          top: '60px',
          width: '90px',
          height: '45px',
          background: 'linear-gradient(to bottom, #e07a5f 0%, #f4f1de 100%)',
          borderRadius: '90px 90px 0 0',
          transform: 'translateX(-50%)',
          opacity: 0.8,
          filter: 'blur(3px)',
          zIndex: 2
        }}
      />

      {/* 3. PERSPECTIVE GRID FOR SOIL SHOLDER LANDSCAPES */}
      <div 
        style={{
          position: 'absolute',
          top: '90px',
          left: '0',
          width: '100%',
          height: '150px',
          background: isDark 
            ? 'linear-gradient(to bottom, transparent 0%, #0d121c 100%)'
            : 'linear-gradient(to bottom, transparent 0%, #f1f5f9 100%)',
          zIndex: 3
        }}
      />

      {/* 4. DYNAMIC 3D NATIONAL HIGHWAY 16 PLANE */}
      <div 
        className="extreme-3d-road-plane"
        style={{
          position: 'absolute',
          top: '90px',
          left: '0',
          width: '100%',
          height: '150px',
          perspective: '150px',
          perspectiveOrigin: '50% 15%',
          zIndex: 4,
          overflow: 'hidden'
        }}
      >
        {/* Receding Asphalt Roadbed */}
        <div 
          style={{
            position: 'absolute',
            width: '260px',
            height: '350px',
            left: '50%',
            marginLeft: '-130px',
            background: isDark ? '#232936' : '#4b5563', 
            transform: 'rotateX(75deg) translateY(-85px)',
            transformOrigin: 'top center',
            borderLeft: '5px solid #ffeb3b', 
            borderRight: '5px solid #ffeb3b',
            boxShadow: '0 0 25px rgba(0,0,0,0.6)',
            backgroundImage: 'linear-gradient(90deg, transparent 46%, #38a169 47%, #2f855a 50%, #38a169 53%, transparent 54%)',
            backgroundSize: '100% 100%',
            overflow: 'hidden'
          }}
        >
          {/* Yellow-Black divider curb lines */}
          <div style={{ position: 'absolute', left: '115px', width: '3px', height: '100%', background: 'repeating-linear-gradient(#000, #000 8px, #ffeb3b 8px, #ffeb3b 16px)' }} />
          <div style={{ position: 'absolute', left: '142px', width: '3px', height: '100%', background: 'repeating-linear-gradient(#000, #000 8px, #ffeb3b 8px, #ffeb3b 16px)' }} />

          {/* Animated Road Lane separator lines */}
          <div 
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              background: 'repeating-linear-gradient(to bottom, transparent, transparent 20px, rgba(255,255,255,0.7) 20px, rgba(255,255,255,0.7) 40px)',
              backgroundSize: '100% 100%',
              animation: 'perspectiveRoadScroll 0.4s linear infinite',
              opacity: 0.6
            }}
          />
        </div>
      </div>

      {/* 5. Coconut trees and Green NH-16 boards */}
      <div style={{ position: 'absolute', top: '90px', left: 0, width: '100%', height: '150px', zIndex: 5, pointerEvents: 'none' }}>
        {sceneryItems.map((item) => {
          const isLeft = item.side === 'left';
          return (
            <div
              key={item.id}
              style={{
                position: 'absolute',
                left: isLeft ? '45%' : '55%',
                bottom: 0,
                animationName: isLeft ? 'sceneryLeft3d' : 'sceneryRight3d',
                animationDuration: `${item.duration}s`,
                animationTimingFunction: 'linear',
                animationFillMode: 'forwards'
              }}
            >
              {item.type === 'coconut' ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '2px', marginBottom: '-5px' }}>
                    <div style={{ width: '8px', height: '8px', background: '#276749', borderRadius: '50% 50% 0 50%' }} />
                    <div style={{ width: '8px', height: '8px', background: '#2f855a', borderRadius: '50% 50% 50% 0' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '3px', marginBottom: '-4px' }}>
                    <div style={{ width: '6px', height: '6px', background: '#2f855a', borderRadius: '50%' }} />
                    <div style={{ width: '6px', height: '6px', background: '#276749', borderRadius: '50%' }} />
                  </div>
                  <div style={{ width: '2px', height: '28px', background: '#744210', transform: 'rotate(5deg)' }} />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div 
                    style={{ 
                      width: '45px', 
                      height: '24px', 
                      background: '#1b4332', 
                      border: '1.5px solid #fff', 
                      borderRadius: '2px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                      padding: '1px'
                    }}
                  >
                    <span style={{ fontSize: '3px', color: '#ffb300', fontWeight: 'bold' }}>NH 16</span>
                    <span style={{ fontSize: '3px', color: '#fff', textAlign: 'center', lineHeight: 1.1 }}>
                      {language === 'en' ? 'VIJAYAWADA' : 'విజయవాడ'}
                    </span>
                  </div>
                  <div style={{ width: '1.5px', height: '20px', background: '#718096' }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 6. DYNAMIC INDIAN VEHICLES SPEEDING IN 3D PERSPECTIVE (Left side up, right side down) */}
      <div 
        style={{
          position: 'absolute',
          top: '90px',
          left: 0,
          width: '100%',
          height: '150px',
          zIndex: 6,
          pointerEvents: 'none'
        }}
      >
        {vehicles.map((v) => {
          const isUp = v.lane.direction === 'up';
          return (
            <div
              key={v.id}
              style={{
                position: 'absolute',
                left: v.lane.leftOffset,
                transform: 'translateX(-50%)',
                bottom: 0,
                color: v.color,
                // Assign corresponding animation based on travel direction!
                animationName: isUp ? 'drivePerspective3DUp' : 'drivePerspective3DDown',
                animationDuration: `${v.duration}s`,
                animationTimingFunction: isUp ? 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
                animationFillMode: 'forwards',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              {/* 3D Headlight glows - only show front headlight glow for incoming cars (direction down) */}
              {isDark && !isUp && (
                <div 
                  style={{
                    width: '40px',
                    height: '50px',
                    background: 'radial-gradient(ellipse at bottom, rgba(255, 235, 59, 0.55) 0%, rgba(255, 235, 59, 0) 80%)',
                    marginBottom: '-12px',
                    opacity: 0.8,
                    zIndex: 0
                  }}
                />
              )}
              
              {/* Render High-fidelity Indian 3D vehicle depending on direction */}
              <div style={{ zIndex: 1 }}>
                {isUp ? VEHICLE_REAR[v.type](v.color) : VEHICLE_FRONT[v.type](v.color)}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
export default LiveBackground;
