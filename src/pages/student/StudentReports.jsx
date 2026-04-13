import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

const StudentReports = () => {
  const { year } = useParams();
  const { user } = useAuth();
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!user?.uid || !year) return;
    const load = async () => {
      const q = query(collection(db, 'results'), where('studentId', '==', user.uid), where('year', '==', year));
      const snap = await getDocs(q);
      const list = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      setResults(list);
    };
    load();
  }, [user, year]);

  return (
    <div className="card">
      <h3>My Reports • {year}</h3>
      <div style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Test</th><th>Score</th><th>Total</th><th>Date</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.id}>
                <td>{r.testTitle}</td>
                <td>{r.score}</td>
                <td>{r.total}</td>
                <td>{r.submittedAt?.toDate ? r.submittedAt.toDate().toLocaleString() : ''}</td>
              </tr>
            ))}
            {results.length === 0 && (
              <tr><td colSpan={4}>No reports yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentReports;
