import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

const StudentTests = () => {
  const { year } = useParams();
  const navigate = useNavigate();
  const { profile, user } = useAuth();

  const [tests, setTests] = useState([]);
  const [completedById, setCompletedById] = useState({});
  const [active, setActive] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  // Load tests for the year
  useEffect(() => {
    if (!year) return;
    const loadTests = async () => {
      const q = query(collection(db, 'tests'), where('year', '==', year));
      const snap = await getDocs(q);
      const list = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      setTests(list);
    };
    loadTests();
  }, [year]);

  // Load completed results for this student/year
  useEffect(() => {
    if (!user || !year) return;
    const loadResults = async () => {
      const q = query(
        collection(db, 'results'),
        where('studentId', '==', user.uid),
        where('year', '==', year)
      );
      const snap = await getDocs(q);
      const done = {};
      snap.forEach((d) => {
        const data = d.data();
        done[data.testId] = { score: data.score, total: data.total, id: d.id };
      });
      setCompletedById(done);
    };
    loadResults();
  }, [user, year]);

  const startTest = (t) => {
    if (completedById[t.id]) return;
    setActive(t);
    setAnswers({});
    setResult(null);
  };

  const submit = async () => {
    if (!active) return;
    if (completedById[active.id]) {
      setActive(null);
      return;
    }
    const questions = active.questions || [];
    let score = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) score += 1;
    });
    const total = questions.length;
    const docRef = await addDoc(collection(db, 'results'), {
      studentId: user.uid,
      studentName: profile?.name,
      email: profile?.email,
      year,
      testId: active.id,
      testTitle: active.title,
      answers,
      score,
      total,
      submittedAt: serverTimestamp()
    });
    const newCompleted = { ...completedById, [active.id]: { score, total, id: docRef.id } };
    setCompletedById(newCompleted);
    setResult({ score, total, id: docRef.id });
    setActive(null);
  };

  // If someone tries to route into a test they already completed (e.g., via URL), bounce them back
  useEffect(() => {
    if (active && completedById[active.id]) {
      setActive(null);
      navigate(`/student/year/${encodeURIComponent(year)}/tests`);
    }
  }, [active, completedById, navigate, year]);

  const cards = useMemo(
    () => tests.map((t) => ({ ...t, completed: Boolean(completedById[t.id]) })),
    [tests, completedById]
  );

  return (
    <div className="card">
      <h3>Tests • {year}</h3>
      <div className="grid grid-2">
        {cards.map((t) => (
          <div key={t.id} className="card">
            <div style={{ fontWeight: 700 }}>{t.title}</div>
            <div style={{ fontSize: 13, color: '#475569' }}>Unit {t.unitNumber}</div>
            {t.completed ? (
              <button
                className="btn btn-secondary card-action"
                style={{ cursor: 'not-allowed', background: '#e0f2fe', color: '#0369a1' }}
                disabled
              >
                Completed
              </button>
            ) : (
              <button className="btn btn-primary card-action" onClick={() => startTest(t)}>
                Open
              </button>
            )}
          </div>
        ))}
      </div>

      {active && !completedById[active.id] && (
        <div className="card" style={{ marginTop: 16 }}>
          <h4>{active.title}</h4>
          {(active.questions || []).map((q, idx) => (
            <div key={idx} style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 600 }}>{idx + 1}. {q.questionText}</div>
              {q.options.map((opt, oi) => (
                <label key={oi} style={{ display: 'block', padding: '6px 0' }}>
                  <input
                    type="radio"
                    name={`q-${idx}`}
                    checked={answers[idx] === oi}
                    onChange={() => setAnswers({ ...answers, [idx]: oi })}
                  />{' '}
                  {opt}
                </label>
              ))}
            </div>
          ))}
          <button className="btn btn-primary" onClick={submit}>Submit</button>
          {result && (
            <div style={{ marginTop: 12, fontWeight: 700 }}>
              Score: {result.score}/{result.total}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentTests;
