import React from 'react';
import { useAuth } from '../../context/AuthContext';

const AdminProfile = () => {
  const { profile } = useAuth();
  const initials = (profile?.name || 'Admin')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="profile-hero">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div className="pill info" style={{ marginBottom: 6 }}>Tamil Learning</div>
            <h2 style={{ margin: 0, letterSpacing: '-0.01em' }}>{profile?.year || 'Admin Console'}</h2>
            <div style={{ color: '#5b6b87', marginTop: 4 }}>Your account overview</div>
          </div>
          <div className="profile-pill">
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
            {profile?.email}
          </div>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="avatar-chip">{initials}</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{profile?.name || 'Admin'}</div>
              <div style={{ color: '#64748b', fontWeight: 600 }}>{profile?.role || 'admin'}</div>
            </div>
          </div>

          <div className="profile-row">
            Email <span>{profile?.email}</span>
          </div>
          <div className="profile-row">
            Role <span>{profile?.role || 'admin'}</span>
          </div>
          {profile?.year && (
            <div className="profile-row">
              Assigned Year <span>{profile.year}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
