import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Trash2, Award } from 'lucide-react';
import api from '../../../utils/api';

// Recenter Map sub-component
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 14);
    }
  }, [center, map]);
  return null;
}

export default function SpacesMap({ user, socket }) {
  const [pins, setPins] = useState([]);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [pinType, setPinType] = useState('social');
  const [myPin, setMyPin] = useState(null);
  const [mapCenter, setMapCenter] = useState([14.5995, 120.9842]); // Manila default fallback
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Load all active pins from API
  const loadPins = async () => {
    try {
      const res = await api.get('/spaces/pins');
      if (res.data.success) {
        setPins(res.data.pins);
        const foundMyPin = res.data.pins.find(p => p.user._id === user.id);
        if (foundMyPin) {
          setMyPin(foundMyPin);
          setMapCenter([foundMyPin.latitude, foundMyPin.longitude]);
        }
      }
    } catch (err) {
      console.error('Error loading active pins:', err);
    }
  };

  useEffect(() => {
    loadPins();
    detectLocation();

    if (socket) {
      socket.on('pin_received', (newPin) => {
        setPins(prev => {
          const filtered = prev.filter(p => p.user._id !== newPin.user._id);
          return [...filtered, newPin];
        });
        if (newPin.user._id === user.id) {
          setMyPin(newPin);
        }
      });

      socket.on('pin_deleted', ({ userId }) => {
        setPins(prev => prev.filter(p => p.user._id !== userId));
        if (userId === user.id) {
          setMyPin(null);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('pin_received');
        socket.off('pin_deleted');
      }
    };
  }, [socket]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setMapCenter([position.coords.latitude, position.coords.longitude]);
        setLoadingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLatitude(14.5995);
        setLongitude(120.9842);
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleDropPin = async (e) => {
    e.preventDefault();
    if (latitude === null || longitude === null) {
      alert('Detecting your location first...');
      return;
    }

    try {
      const res = await api.post('/spaces/pin', {
        latitude,
        longitude,
        statusMessage,
        type: pinType
      });

      if (res.data.success) {
        setMyPin(res.data.pin);
        loadPins();
        setStatusMessage('');
        if (socket) {
          socket.emit('new_pin', res.data.pin);
        }
      }
    } catch (err) {
      console.error('Error dropping pin:', err);
    }
  };

  const handleRemovePin = async () => {
    try {
      const res = await api.delete('/spaces/pin');
      if (res.data.success) {
        setMyPin(null);
        loadPins();
        if (socket) {
          socket.emit('pin_deleted', { userId: user.id });
        }
      }
    } catch (err) {
      console.error('Error deleting pin:', err);
    }
  };

  const createMarkerIcon = (profilePic, isPremium) => {
    return new L.DivIcon({
      html: `
        <div style="position: relative; width: 40px; height: 40px; transform: translate(-2px, -2px);">
          <img src="${profilePic || '/default-avatar.png'}" 
               style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover; 
                      border: 3px solid ${isPremium ? '#f59e0b' : '#6366f1'}; 
                      box-shadow: 0 0 10px rgba(99, 102, 241, 0.6);" />
          ${isPremium ? '<div style="position: absolute; top: -6px; right: -6px; background: #f59e0b; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; font-size: 8px; color: black; border: 1px solid white;">👑</div>' : ''}
        </div>
      `,
      className: 'custom-leaflet-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20]
    });
  };

  const getPinColorClass = (type) => {
    switch (type) {
      case 'study': return '#3b82f6';
      case 'food': return '#ef4444';
      case 'gaming': return '#ec4899';
      case 'chilling': return '#10b981';
      default: return '#a855f7';
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', height: '100%' }}>
      
      {/* Spaces Side controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* Drop Pin Box */}
        <div className="glass-panel" style={{ padding: '16px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Navigation size={18} color="var(--color-primary)" />
            <span>Spaces Check-in</span>
          </h3>

          {!myPin ? (
            <form onSubmit={handleDropPin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Share your temporary 2-hour status pin with your friends.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Status Message</label>
                <input
                  type="text"
                  placeholder="What are you up to?"
                  value={statusMessage}
                  onChange={(e) => setStatusMessage(e.target.value)}
                  style={{ fontSize: '12px' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Pin Category</label>
                <select 
                  value={pinType} 
                  onChange={(e) => setPinType(e.target.value)}
                  style={{ fontSize: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', color: 'var(--text-main)' }}
                >
                  <option value="social">💬 Social / Meetup</option>
                  <option value="study">📚 Studying / Working</option>
                  <option value="food">🍕 Grabbing Food</option>
                  <option value="gaming">🎮 Gaming Session</option>
                  <option value="chilling">🧘 Chilling out</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>Lat: {latitude ? latitude.toFixed(4) : 'Detecting...'}</span>
                <span>Lon: {longitude ? longitude.toFixed(4) : 'Detecting...'}</span>
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loadingLocation || latitude === null}
                style={{ width: '100%', padding: '8px', fontSize: '13px', marginTop: '4px' }}
              >
                {loadingLocation ? 'Detecting Location...' : 'Broadcast Location'}
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', padding: '10px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: getPinColorClass(myPin.type), fontWeight: '700' }}>
                    Active Pin ({myPin.type})
                  </span>
                  <button onClick={handleRemovePin} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--color-danger)' }} title="Remove check-in">
                    <Trash2 size={14} />
                  </button>
                </div>
                <p style={{ fontSize: '13px', marginTop: '6px', fontWeight: '500' }}>{myPin.statusMessage}</p>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Expires: {new Date(myPin.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <button onClick={detectLocation} className="btn-secondary" style={{ width: '100%', padding: '6px', fontSize: '12px' }}>
                Update Coordinates
              </button>
            </div>
          )}
        </div>

        {/* Active Pins List */}
        <div className="glass-panel" style={{ padding: '16px', flex: 1, overflowY: 'auto', maxHeight: '350px' }}>
          <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '14px', marginBottom: '10px', color: 'var(--text-main)' }}>
            Active Friends ({pins.length})
          </h4>
          {pins.length === 0 ? (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
              No check-ins at the moment.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pins.map(p => (
                <div
                  key={p._id}
                  onClick={() => setMapCenter([p.latitude, p.longitude])}
                  style={{ 
                    padding: '8px', 
                    borderRadius: '6px', 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid var(--border-glass)',
                    borderLeft: `3px solid ${getPinColorClass(p.type)}`,
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  className="sidebar-link"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src={p.user.profilePic || '/default-avatar.png'} alt={p.user.username} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <span style={{ fontSize: '12px', fontWeight: '700' }}>{p.user.username}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-main)' }}>{p.statusMessage}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Map Canvas */}
      <div style={{ height: '100%', position: 'relative' }}>
        <MapContainer 
          center={mapCenter} 
          zoom={14} 
          scrollWheelZoom={true} 
          style={{ width: '100%', height: '100%', minHeight: '450px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://locationiq.com">LocationIQ</a>'
            url={`https://{s}.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=${import.meta.env.VITE_LOCATIONIQ_ACCESS_TOKEN || 'pk.e31e6705bd87772aa6b6ab21a599c867'}`}
          />

          <RecenterMap center={mapCenter} />

          {pins.map(p => (
            <Marker 
              key={p._id}
              position={[p.latitude, p.longitude]}
              icon={createMarkerIcon(p.user.profilePic, p.user.isPremium)}
            >
              <Popup>
                <div style={{ minWidth: '150px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <img src={p.user.profilePic || '/default-avatar.png'} alt={p.user.username} style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                    <strong style={{ fontSize: '12px', color: '#fff' }}>{p.user.username}</strong>
                    {p.user.isPremium && <span style={{ color: 'var(--premium-gold)', fontSize: '9px' }}>👑</span>}
                  </div>
                  <span style={{ fontSize: '10px', background: getPinColorClass(p.type), padding: '2px 6px', borderRadius: '10px', color: 'white', textTransform: 'uppercase', fontWeight: 'bold' }}>
                    {p.type}
                  </span>
                  <p style={{ fontSize: '12px', color: '#fff', marginTop: '6px', fontWeight: '500' }}>{p.statusMessage}</p>
                  <small style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                    Expires: {new Date(p.expiresAt).toLocaleTimeString()}
                  </small>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

    </div>
  );
}
