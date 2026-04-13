import React from 'react';

const ConfirmDeleteModal = ({ open, onClose, onConfirm, text }) => {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.35)',
      display: 'grid', placeItems: 'center', zIndex: 20
    }}>
      <div className="card" style={{ maxWidth: 360 }}>
        <h4>Confirm delete</h4>
        <div style={{ color: '#475569', marginBottom: 12 }}>{text}</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
