import React from 'react';

const SectionCard = ({ title, subtitle, onClick, children }) => (
  <div className="card section-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: 13, color: '#64748b' }}>{subtitle}</div>
        <div style={{ fontWeight: 700, fontSize: 18 }}>{title}</div>
      </div>
      {children}
    </div>
  </div>
);

export default SectionCard;
