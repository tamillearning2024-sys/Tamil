import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

const StudentNotes = () => {
  const { year } = useParams();
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState({ title: '', content: '' });
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    if (!user?.uid) return;
    const q = query(collection(db, 'notes'), where('studentId', '==', user.uid), where('year', '==', year));
    const snap = await getDocs(q);
    const list = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
    setNotes(list);
  };

  useEffect(() => { load(); }, [user, year]);

  const saveNote = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (editingId) {
      await updateDoc(doc(db, 'notes', editingId), {
        title: form.title,
        content: form.content,
        updatedAt: new Date()
      });
    } else {
      await addDoc(collection(db, 'notes'), {
        studentId: user.uid,
        year,
        title: form.title,
        content: form.content,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    setForm({ title: '', content: '' });
    setEditingId(null);
    load();
  };

  const editNote = (n) => {
    setEditingId(n.id);
    setForm({ title: n.title, content: n.content });
  };

  const removeNote = async (id) => {
    await deleteDoc(doc(db, 'notes', id));
    load();
  };

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <h3>My Notes • {year}</h3>
        <form onSubmit={saveNote} className="grid" style={{ gap: 10 }}>
          <input className="input" placeholder="Title" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea className="input" rows={4} placeholder="Content"
            value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" type="submit">{editingId ? 'Update' : 'Add'} Note</button>
            {editingId && <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setForm({ title: '', content: '' }); }}>Cancel</button>}
          </div>
        </form>
      </div>
      <div className="grid grid-2">
        {notes.map((n) => (
          <div key={n.id} className="card">
            <div style={{ fontWeight: 700 }}>{n.title}</div>
            <div style={{ fontSize: 14, color: '#475569', whiteSpace: 'pre-wrap' }}>{n.content}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="btn btn-secondary" onClick={() => editNote(n)}>Edit</button>
              <button className="btn btn-secondary" onClick={() => removeNote(n.id)}>Delete</button>
            </div>
          </div>
        ))}
        {notes.length === 0 && <div>No notes yet.</div>}
      </div>
    </div>
  );
};

export default StudentNotes;
