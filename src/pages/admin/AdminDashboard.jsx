import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import SectionCard from "../../components/SectionCard";

const yearList = ['1st Year', '2nd Year', '3rd Year'];

const normalizeScore = (result) => {
  const score = Number(result?.score) || 0;
  const total = Number(result?.total) || 0;
  if (!total) return score || 0;
  return (score / total) * 100;
};

const AdminDashboard = () => {
  const [selectedYear, setSelectedYear] = useState(yearList[0]);
  const [students, setStudents] = useState([]);
  const [tests, setTests] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [results, setResults] = useState([]);
  const [units, setUnits] = useState([]);
  const [yearCounts, setYearCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const studentSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'student')));
      const testSnap = await getDocs(collection(db, 'tests'));
      const taskSnap = await getDocs(collection(db, 'tasks'));
      const resultSnap = await getDocs(collection(db, 'results'));
      const unitSnap = await getDocs(collection(db, 'units'));

      const sList = [];
      const yCount = { '1st Year': 0, '2nd Year': 0, '3rd Year': 0 };
      studentSnap.forEach((d) => {
        const data = d.data();
        sList.push({ id: d.id, uid: data.uid || d.id, ...data });
        if (yCount[data.year] !== undefined) yCount[data.year] += 1;
      });

      const tList = [];
      testSnap.forEach((d) => tList.push({ id: d.id, ...d.data() }));

      const taskList = [];
      taskSnap.forEach((d) => taskList.push({ id: d.id, ...d.data() }));

      const rList = [];
      resultSnap.forEach((d) => rList.push({ id: d.id, ...d.data() }));

      const uList = [];
      unitSnap.forEach((d) => uList.push({ id: d.id, ...d.data() }));

      setStudents(sList);
      setTests(tList);
      setTasks(taskList);
      setResults(rList);
      setUnits(uList);
      setYearCounts(yCount);
      setLoading(false);
    };
    load();
  }, []);

  const yearTests = useMemo(() => tests.filter((t) => t.year === selectedYear), [tests, selectedYear]);
  const yearTasks = useMemo(() => tasks.filter((t) => t.year === selectedYear), [tasks, selectedYear]);
  const yearUnits = useMemo(() => units.filter((u) => u.year === selectedYear), [units, selectedYear]);

  const studentRows = useMemo(() => {
    const rows = students
      .filter((s) => s.year === selectedYear)
      .map((s) => {
        const attempts = results.filter((r) => r.studentId === s.uid && (!r.year || r.year === selectedYear));
        const avgScore = attempts.length
          ? Math.round(attempts.reduce((sum, r) => sum + normalizeScore(r), 0) / attempts.length)
          : 0;
        const latest = attempts
          .slice()
          .sort((a, b) => {
            const ta = a.submittedAt?.toDate ? a.submittedAt.toDate().getTime() : 0;
            const tb = b.submittedAt?.toDate ? b.submittedAt.toDate().getTime() : 0;
            return tb - ta;
          })[0];
        const latestScore = latest ? Math.round(normalizeScore(latest)) : 0;

        const progress = avgScore;
        const status = progress >= 100 ? 'completed' : 'pending';

        return {
          id: s.uid || s.id,
          name: s.name || 'Unnamed',
          email: s.email,
          completedTests: attempts.length,
          totalTests: yearTests.length,
          progress,
          latestScore,
          status
        };
      });
    return rows.sort((a, b) => b.progress - a.progress);
  }, [students, results, selectedYear, yearTests.length]);

  const avgProgress = useMemo(() => {
    if (!results.length) return 0;
    const total = results.reduce((sum, r) => sum + normalizeScore(r), 0);
    return Math.round(total / results.length);
  }, [results]);

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="grid grid-4">
        <div className="stat-card">
          <div className="stat-title">Total Students</div>
          <div className="stat-value">{students.length}</div>
          <div className="stat-meta">Across all years</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Tests</div>
          <div className="stat-value">{tests.length}</div>
          <div className="stat-meta">{results.length} attempts logged</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Tasks</div>
          <div className="stat-value">{tasks.length}</div>
          <div className="stat-meta">{yearTasks.length} active in {selectedYear}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Average Progress</div>
          <div className="stat-value">{avgProgress}%</div>
          <div className="progress-track">
            <div className="progress-bar" style={{ width: `${avgProgress}%` }} />
          </div>
        </div>
      </div>

      <div className="card glass" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div className="pill info">Admin / Overview</div>
            <h2 style={{ margin: '8px 0 0', letterSpacing: '-0.01em' }}>Tamil Learning</h2>
          </div>
          <button className="btn btn-primary" onClick={() => navigate(`/admin/year/${encodeURIComponent(selectedYear)}/dashboard`)}>
            Student Progress
          </button>
        </div>
        <div className="tag-row">
          {yearList.map((y) => (
            <button
              key={y}
              className={`chip ${selectedYear === y ? 'active' : ''}`}
              onClick={() => setSelectedYear(y)}
            >
              {y} ({yearCounts[y] || 0})
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: 13, color: '#6b7a99' }}>Students in {selectedYear}</div>
            <h3 style={{ margin: '6px 0 0' }}>{studentRows.length} enrolled</h3>
          </div>
          <div className="tag-row">
            <div className="badge neutral">Units: {yearUnits.length || 0}</div>
            <div className="badge neutral">Tests: {yearTests.length || 0}</div>
            <div className="badge neutral">Tasks: {yearTasks.length || 0}</div>
          </div>
        </div>

        <div className="table-wrapper" style={{ marginTop: 12 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Tests Completed</th>
                <th>Total Tests</th>
                <th>Progress</th>
                <th>Latest Score</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={8}>Loading...</td></tr>
              )}
              {!loading && studentRows.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td className="wrap-text">{s.email}</td>
                  <td>{s.completedTests}</td>
                  <td>{s.totalTests}</td>
                  <td>
                    <div className="progress-track" style={{ width: 120 }}>
                      <div className="progress-bar" style={{ width: `${s.progress}%` }} />
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7a99' }}>{s.progress}%</div>
                  </td>
                  <td>{s.latestScore ? `${s.latestScore}%` : '—'}</td>
                  <td>
                    {s.status === 'completed' ? (
                      <span className="pill success">Completed</span>
                    ) : (
                      <span className="pill info">Pending</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      onClick={() => navigate(`/admin/year/${encodeURIComponent(selectedYear)}/students`)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && studentRows.length === 0 && (
                <tr><td colSpan={8}>No students in this year yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-3">
        <SectionCard
          title="Units"
          subtitle={`${yearUnits.length} total`}
          onClick={() => navigate(`/admin/year/${encodeURIComponent(selectedYear)}/units`)}
        >
          <div className="pill info">Open</div>
        </SectionCard>
        <SectionCard
          title="Tests"
          subtitle={`${yearTests.length} created`}
          onClick={() => navigate(`/admin/year/${encodeURIComponent(selectedYear)}/tests`)}
        >
          <div className="pill info">Manage</div>
        </SectionCard>
        <SectionCard
          title="Tasks"
          subtitle={`${yearTasks.length} active`}
          onClick={() => navigate(`/admin/year/${encodeURIComponent(selectedYear)}/tasks`)}
        >
          <div className="pill info">Assign</div>
        </SectionCard>
      </div>
    </div>
  );
};

export default AdminDashboard;
