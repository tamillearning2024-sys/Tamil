import React, { useEffect, useState } from 'react';

const TaskFormModal = ({ open, onClose, onSave, initial, year }) => {
  const [form, setForm] = useState(initial || { title: '', description: '', dueDate: '', fileLink: '', status: 'active' });

  useEffect(() => {
    setForm(initial || { title: '', description: '', dueDate: '', fileLink: '', status: 'active' });
  }, [initial]);

  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', display: 'grid', placeItems: 'center', zIndex: 50 }}>
      <div className="card" style={{ maxWidth: 520, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>{initial ? 'Update Task' : 'Add Task'}</h3>
          <div className="pill">{year}</div>
        </div>
        <div className="grid" style={{ gap: 10, marginTop: 12 }}>
          <input className="input" placeholder="Task title" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea className="input" rows={3} placeholder="Description"
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input className="input" type="date" value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          <input className="input" placeholder="File/Drive link (optional)" value={form.fileLink}
            onChange={(e) => setForm({ ...form, fileLink: e.target.value })} />
          <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={() => onSave(form)}>{initial ? 'Update' : 'Save'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskFormModal;
