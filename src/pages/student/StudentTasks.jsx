import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase';

const StudentTasks = () => {
  const { year } = useParams();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!year) return;
    const q = query(collection(db, 'tasks'), where('year', '==', year));
    const unsub = onSnapshot(q, (snap) => {
      const list = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      setTasks(list);
    });
    return () => unsub();
  }, [year]);

  return (
    <div className="card">
      <h3>Tasks • {year}</h3>
      <div className="grid grid-2">
        {tasks.map((t) => (
          <div key={t.id} className="card">
            <div style={{ fontWeight: 700 }}>{t.title}</div>
            <div style={{ fontSize: 13, color: '#475569' }}>{t.description}</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Due: {t.dueDate || 'N/A'}</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Status: {t.status || 'active'}</div>
            {t.fileLink && <a className="btn btn-secondary card-action" href={t.fileLink} target="_blank" rel="noreferrer">Open Link</a>}
          </div>
        ))}
        {tasks.length === 0 && <div>No tasks yet.</div>}
      </div>
    </div>
  );
};

export default StudentTasks;
