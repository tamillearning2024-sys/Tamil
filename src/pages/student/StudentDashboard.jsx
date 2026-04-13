import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import DashboardCard from "../../components/DashboardCard";

const StudentDashboard = () => {
  const { year } = useParams();
  const { user, profile } = useAuth();
  const base = `/student/year/${encodeURIComponent(year)}`;

  const [counts, setCounts] = useState({ units: 0, tests: 0, tasks: 0, reports: 0, notes: 0 });
  const [tasks, setTasks] = useState([]);
  const [tests, setTests] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!year || !user) return;

    const unsubscribers = [];

    const qUnits = query(collection(db, 'units'), where('year', '==', year));
    unsubscribers.push(onSnapshot(qUnits, (snap) => {
      setCounts((c) => ({ ...c, units: snap.size }));
    }));

    const qTests = query(collection(db, 'tests'), where('year', '==', year));
    unsubscribers.push(onSnapshot(qTests, (snap) => {
      const list = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      setTests(list);
      setCounts((c) => ({ ...c, tests: snap.size }));
    }));

    const qTasks = query(collection(db, 'tasks'), where('year', '==', year));
    unsubscribers.push(onSnapshot(qTasks, (snap) => {
      const list = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      list.sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
      setTasks(list);
      setCounts((c) => ({ ...c, tasks: snap.size }));
    }));

    const qResults = query(
      collection(db, 'results'),
      where('studentId', '==', user.uid),
      where('year', '==', year)
    );
    unsubscribers.push(onSnapshot(qResults, (snap) => {
      const list = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      setResults(list);
      setCounts((c) => ({ ...c, reports: snap.size }));
    }));

    const qNotes = query(
      collection(db, 'notes'),
      where('studentId', '==', user.uid),
      where('year', '==', year)
    );
    unsubscribers.push(onSnapshot(qNotes, (snap) => {
      setCounts((c) => ({ ...c, notes: snap.size }));
    }));

    return () => unsubscribers.forEach((u) => u());
  }, [year, user]);

  const avgScore = useMemo(() => {
    if (!results.length) return 0;
    const total = results.reduce((sum, r) => {
      const score = Number(r.score) || 0;
      const totalQ = Number(r.total) || 100;
      const pct = totalQ ? (score / totalQ) * 100 : score;
      return sum + pct;
    }, 0);
    return Math.round(total / results.length);
  }, [results]);

  const summaryCards = [
    {
      title: 'Year',
      value: year,
      subtitle: 'Keep up the momentum.',
      to: null,
      pill: 'Student'
    },
    {
      title: 'Average Score',
      value: `${avgScore}%`,
      subtitle: 'Your overall performance',
      to: `${base}/reports`,
      pill: null
    },
    {
      title: 'Reports',
      value: counts.reports,
      subtitle: 'Attempts submitted',
      to: `${base}/reports`,
      pill: null
    }
  ];

  const mainCards = [
    { title: 'Units', value: counts.units, subtitle: 'Dive into lessons', to: `${base}/units` },
    { title: 'Tests', value: counts.tests, subtitle: 'Practice & assess', to: `${base}/tests` },
    { title: 'Tasks', value: counts.tasks, subtitle: 'Assignments to finish', to: `${base}/tasks` },
    { title: 'Reports', value: counts.reports, subtitle: 'Your scores', to: `${base}/reports` },
    { title: 'Notes', value: counts.notes, subtitle: 'Saved notes', to: `${base}/notes` }
  ];

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="card glass" style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div className="avatar-chip">{(profile?.name || 'ST').slice(0, 2).toUpperCase()}</div>
          <div>
            <div style={{ fontWeight: 800 }}>{profile?.name || 'Student'}</div>
            <div style={{ color: '#64748b', wordBreak: 'break-word' }}>{profile?.email}</div>
          </div>
        </div>
        <div className="pill info">{profile?.role || 'student'}</div>
      </div>

      <div className="grid grid-3">
        {summaryCards.map((c) => (
          <DashboardCard key={c.title} {...c} />
        ))}
      </div>

      <div className="grid grid-3">
        {mainCards.map((c) => (
          <DashboardCard key={c.title} {...c} />
        ))}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0 }}>Upcoming Tests</h3>
          <Link className="btn btn-secondary" to={`${base}/tests`}>View all</Link>
        </div>
        {tests.length === 0 && <div style={{ marginTop: 8 }}>No tests yet.</div>}
        <div className="tag-row" style={{ marginTop: 10, flexWrap: 'wrap' }}>
          {tests.slice(0, 4).map((t) => (
            <div key={t.id} className="card" style={{ minWidth: 220 }}>
              <div style={{ fontWeight: 700 }}>{t.title}</div>
              <div style={{ fontSize: 13, color: '#6b7a99' }}>Unit {t.unitNumber}</div>
              <div className="badge neutral">Questions: {t.questions?.length || 0}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0 }}>Tasks</h3>
          <Link className="btn btn-secondary" to={`${base}/tasks`}>Open tasks</Link>
        </div>
        {tasks.length === 0 && <div style={{ marginTop: 8 }}>No tasks assigned.</div>}
        <div className="grid grid-2" style={{ marginTop: 10 }}>
          {tasks.map((t) => (
            <div key={t.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <div style={{ fontWeight: 700 }}>{t.title}</div>
                <span className="pill info">{t.status || 'active'}</span>
              </div>
              <div style={{ fontSize: 13, color: '#6b7a99', marginTop: 6 }}>{t.description}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>Due: {t.dueDate || '—'}</div>
              {t.fileLink && (
                <a className="btn btn-secondary" style={{ marginTop: 10 }} href={t.fileLink} target="_blank" rel="noreferrer">
                  File link
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
