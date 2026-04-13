import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import EmptyState from '../../components/EmptyState';

const AdminStudents = () => {
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const q = query(collection(db, 'users'), where('role', '==', 'student'));
    const snap = await getDocs(q);
    const p = [], a = [], b = [];
    snap.forEach((d) => {
      const data = { id: d.id, ...d.data() };
      if (data.status === 'approved') a.push(data);
      else if (data.status === 'blocked' || data.status === 'rejected') b.push(data);
      else p.push(data);
    });
    setPending(p);
    setApproved(a);
    setBlocked(b);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (id, status, approved) => {
    await updateDoc(doc(db, 'users', id), { status, approved });
    load();
  };

  const renderTable = (rows, actions) => (
    <div className="card" style={{ marginTop: 12 }}>
      <div className="table-scroll">
        <table className="table progress-table students-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Year</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td className="email-cell">{r.email}</td>
                <td>{r.year}</td>
                <td>{r.status}</td>
                <td style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {actions(r)}
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5}>No records</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid" style={{ gap: 16 }}>
      <h2>Students</h2>

      <h4>Pending Approval</h4>
      {renderTable(pending, (r) => (
        <>
          <button className="btn btn-primary" onClick={() => setStatus(r.id, 'approved', true)}>Approve</button>
          <button className="btn btn-secondary" onClick={() => setStatus(r.id, 'rejected', false)}>Reject</button>
        </>
      ))}

      <h4>Approved</h4>
      {renderTable(approved, (r) => (
        <button className="btn btn-secondary" onClick={() => setStatus(r.id, 'blocked', false)}>Block</button>
      ))}

      <h4>Rejected / Blocked</h4>
      {renderTable(blocked, (r) => (
        <>
          <button className="btn btn-primary" onClick={() => setStatus(r.id, 'approved', true)}>Approve</button>
          <button className="btn btn-secondary" onClick={() => setStatus(r.id, 'blocked', false)}>Block</button>
        </>
      ))}
    </div>
  );
};

export default AdminStudents;
