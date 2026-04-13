import React, { useEffect, useState } from 'react';

const UnitFormModal = ({ open, onClose, onSave, initial, year }) => {
  const [form, setForm] = useState(initial || { unitNumber: 1, title: '', pdfLink: '' });

  useEffect(() => {
    setForm(initial || { unitNumber: 1, title: '', pdfLink: '' });
  }, [initial]);

  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', display: 'grid', placeItems: 'center', zIndex: 50 }}>
      <div className="card" style={{ maxWidth: 520, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>{initial ? 'Update Unit' : 'Add Unit'}</h3>
          <div className="pill">{year}</div>
        </div>
        <div className="grid" style={{ gap: 10, marginTop: 12 }}>
          <select className="input" value={form.unitNumber} onChange={(e) => setForm({ ...form, unitNumber: Number(e.target.value) })}>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>Unit {n}</option>)}
          </select>
          <input className="input" placeholder="Unit title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className="input" placeholder="Google Drive PDF link" value={form.pdfLink} onChange={(e) => setForm({ ...form, pdfLink: e.target.value })} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={() => onSave(form)}>{initial ? 'Update' : 'Save'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitFormModal;
