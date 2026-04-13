import React, { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import EmptyState from '../../components/EmptyState';

const years = ['1st Year', '2nd Year', '3rd Year'];

const AdminReports = () => {
  const [activeYear, setActiveYear] = useState('1st Year');
  const [students, setStudents] = useState([]);
  const [tests, setTests] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [sortType, setSortType] = useState('name-asc');

  useEffect(() => {
    setLoading(true);
    const unsubscribers = [];
    const qs = query(collection(db, 'users'), where('role', '==', 'student'), where('year', '==', activeYear));
    const qt = query(collection(db, 'tests'), where('year', '==', activeYear));
    const qr = query(collection(db, 'results'), where('year', '==', activeYear));

    unsubscribers.push(onSnapshot(qs, (snap) => {
      const s = []; snap.forEach((d) => s.push({ id: d.id, ...d.data() }));
      setStudents(s);
      setLoading(false);
    }));
    unsubscribers.push(onSnapshot(qt, (snap) => {
      const t = []; snap.forEach((d) => t.push({ id: d.id, ...d.data() }));
      setTests(t);
    }));
    unsubscribers.push(onSnapshot(qr, (snap) => {
      const r = []; snap.forEach((d) => r.push({ id: d.id, ...d.data() }));
      setResults(r);
    }));

    return () => unsubscribers.forEach((u) => u());
  }, [activeYear]);

  const studentRows = useMemo(() => {
    const testCount = tests.length || 1;
    const priority = { Completed: 1, 'In Progress': 2, 'Not Started': 3 };

    const rows = students.map((s) => {
      const myResults = results.filter((r) => r.studentId === s.uid);
      const completed = myResults.length;
      const progress = Math.round((completed / testCount) * 100);
      const avgScore = myResults.length
        ? Math.round((myResults.reduce((acc, r) => acc + (r.score / (r.total || 1)) * 100, 0) / myResults.length))
        : 0;
      const latest = myResults.sort((a, b) => (b.submittedAt?.seconds || 0) - (a.submittedAt?.seconds || 0))[0];
      const latestScore = latest ? Math.round((latest.score / (latest.total || 1)) * 100) : 0;
      const status =
        completed === 0
          ? 'Not Started'
          : completed < testCount
            ? 'In Progress'
            : testCount > 0
              ? 'Completed'
              : 'Not Started';
      return {
        ...s,
        totalTests: testCount,
        completed,
        progress,
        avgScore,
        latestScore,
        status,
        statusPriority: priority[status] ?? 4
      };
    });

    // Sort based on dropdown selection
    return rows.sort((a, b) => {
      if (sortType === 'name-asc') return (a.name || '').localeCompare(b.name || '');
      if (sortType === 'name-desc') return (b.name || '').localeCompare(a.name || '');
      if (sortType === 'status') return a.statusPriority - b.statusPriority;
      if (sortType === 'progress') return b.progress - a.progress;
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [students, tests, results, sortType]);

  const summary = useMemo(() => {
    const totalStudents = students.length;
    const totalTests = tests.length;
    const completedTests = studentRows.reduce((acc, r) => acc + r.completed, 0);
    const avgProgress = studentRows.length
      ? Math.round(studentRows.reduce((acc, r) => acc + r.progress, 0) / studentRows.length)
      : 0;
    return { totalStudents, totalTests, completedTests, avgProgress };
  }, [students, tests, studentRows]);

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="tab-row">
        {years.map((y) => (
          <button key={y} className={`tab-btn ${activeYear === y ? 'active' : ''}`} onClick={() => setActiveYear(y)}>
            {y}
          </button>
        ))}
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div style={{ fontSize: 12, color: '#64748b' }}>Total Students</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{summary.totalStudents}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 12, color: '#64748b' }}>Total Tests</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{summary.totalTests}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 12, color: '#64748b' }}>Completed Tests</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{summary.completedTests}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 12, color: '#64748b' }}>Average Progress</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{summary.avgProgress}%</div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0 }}>Student Progress • {activeYear}</h3>
          <select className="input" style={{ width: '200px' }} value={sortType} onChange={(e) => setSortType(e.target.value)}>
            <option value="name-asc">Name (A → Z)</option>
            <option value="name-desc">Name (Z → A)</option>
            <option value="status">Status (Completed First)</option>
            <option value="progress">Progress (High → Low)</option>
          </select>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : studentRows.length === 0 ? (
          <EmptyState message="No students found for this year." />
        ) : (
          <>
            <div className="table-hint">Swipe left/right to view full report</div>
            <div className="table-scroll">
              <table className="table progress-table">
                <thead>
                  <tr>
                    <th>Name</th><th>Email</th><th>Tests Completed</th><th>Total Tests</th>
                    <th>Progress %</th><th>Avg Score</th><th>Latest Score</th><th>Status</th><th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {studentRows.map((r) => (
                    <tr key={r.uid}>
                      <td>{r.name}</td>
                      <td className="email-cell">{r.email}</td>
                      <td>{r.completed}</td>
                      <td>{r.totalTests}</td>
                      <td>{r.progress}%</td>
                      <td>{r.avgScore}%</td>
                      <td>{r.latestScore}%</td>
                      <td>{r.status}</td>
                      <td><button className="btn btn-secondary" onClick={() => setDetail(r)}>View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {detail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.35)', display: 'grid', placeItems: 'center', zIndex: 40 }}>
          <div className="card" style={{ maxWidth: 520, width: '100%' }}>
            <h4>{detail.name}</h4>
            <div style={{ color: '#475569', marginBottom: 8 }}>{detail.email}</div>
            <div>Year: {activeYear}</div>
            <div>Tests Completed: {detail.completed}/{detail.totalTests}</div>
            <div>Progress: {detail.progress}%</div>
            <div>Average Score: {detail.avgScore}%</div>
            <div>Latest Score: {detail.latestScore}%</div>
            <div>Status: {detail.status}</div>
            <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => setDetail(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
