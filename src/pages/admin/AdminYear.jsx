import React, { useEffect, useMemo, useState } from 'react';
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
import EmptyState from '../../components/EmptyState';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import UnitFormModal from '../../components/UnitFormModal';
import TestFormModal from '../../components/TestFormModal';
import TestViewModal from '../../components/TestViewModal';
import TaskFormModal from '../../components/TaskFormModal';

const AdminYear = () => {
  const { yearId } = useParams();
  const [tab, setTab] = useState('units');
  const [units, setUnits] = useState([]);
  const [tests, setTests] = useState([]);
  const [students, setStudents] = useState([]);
  const [reports, setReports] = useState([]);
  const [unitForm, setUnitForm] = useState(null);
  const [testForm, setTestForm] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskForm, setTaskForm] = useState(null);
  const [viewTest, setViewTest] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchStudent, setSearchStudent] = useState('');
  const [searchReport, setSearchReport] = useState('');
  const [filterTest, setFilterTest] = useState('');

  const loadUnits = async () => {
    const q = query(collection(db, 'units'), where('year', '==', yearId));
    const snap = await getDocs(q);
    const list = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
    list.sort((a, b) => a.unitNumber - b.unitNumber);
    setUnits(list);
  };

  const loadTests = async () => {
    const q = query(collection(db, 'tests'), where('year', '==', yearId));
    const snap = await getDocs(q);
    const list = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
    setTests(list);
  };

  const loadStudents = async () => {
    const q = query(collection(db, 'users'), where('role', '==', 'student'), where('year', '==', yearId));
    const snap = await getDocs(q);
    const list = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
    setStudents(list);
  };

  const loadReports = async () => {
    const q = query(collection(db, 'results'), where('year', '==', yearId));
    const snap = await getDocs(q);
    const list = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
    setReports(list);
  };

  const loadTasks = async () => {
    const q = query(collection(db, 'tasks'), where('year', '==', yearId));
    const snap = await getDocs(q);
    const list = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
    setTasks(list);
  };

  useEffect(() => {
    loadUnits();
    loadTests();
    loadStudents();
    loadReports();
    loadTasks();
  }, [yearId]);

  const saveUnit = async (data) => {
    if (unitForm?.id) {
      await updateDoc(doc(db, 'units', unitForm.id), {
        unitNumber: Number(data.unitNumber),
        title: data.title,
        pdfLink: data.pdfLink,
        updatedAt: new Date()
      });
    } else {
      await addDoc(collection(db, 'units'), {
        year: yearId,
        unitNumber: Number(data.unitNumber),
        title: data.title,
        pdfLink: data.pdfLink,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    setUnitForm(null);
    await loadUnits();
  };

  const deleteUnit = async () => {
    if (!deleteTarget) return;
    await deleteDoc(doc(db, deleteTarget.collection, deleteTarget.id));
    setDeleteTarget(null);
    if (deleteTarget.collection === 'units') loadUnits();
    if (deleteTarget.collection === 'tests') loadTests();
    if (deleteTarget.collection === 'tasks') loadTasks();
  };

  const saveTest = async (data) => {
    if (testForm?.id) {
      await updateDoc(doc(db, 'tests', testForm.id), {
        title: data.title,
        unitNumber: Number(data.unitNumber),
        questions: data.questions,
        updatedAt: new Date()
      });
    } else {
      await addDoc(collection(db, 'tests'), {
        year: yearId,
        title: data.title,
        unitNumber: Number(data.unitNumber),
        questions: data.questions,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    setTestForm(null);
    await loadTests();
  };

  const saveTask = async (data) => {
    if (taskForm?.id) {
      await updateDoc(doc(db, 'tasks', taskForm.id), {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        fileLink: data.fileLink,
        status: data.status || 'active',
        updatedAt: new Date()
      });
    } else {
      await addDoc(collection(db, 'tasks'), {
        year: yearId,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        fileLink: data.fileLink,
        status: data.status || 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    setTaskForm(null);
    await loadTasks();
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => s.name?.toLowerCase().includes(searchStudent.toLowerCase()));
  }, [students, searchStudent]);

  const filteredReports = useMemo(() => {
    return reports.filter((r) =>
      r.studentName?.toLowerCase().includes(searchReport.toLowerCase()) &&
      (filterTest ? r.testTitle === filterTest : true)
    );
  }, [reports, searchReport, filterTest]);

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div className="pill">Admin / {yearId}</div>
          <h3 style={{ margin: 8, marginLeft: 0 }}>Manage Year</h3>
        </div>
      </div>

      <div className="tab-row" style={{ flexWrap: 'wrap' }}>
        {[
          { key: 'units', label: 'Units' },
          { key: 'tests', label: 'Tests' },
          { key: 'students', label: 'View Students' },
          { key: 'reports', label: 'Reports' },
          { key: 'tasks', label: 'Tasks' }
        ].map((t) => (
          <button key={t.key} className={`tab-btn ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'units' && (
        <div className="grid" style={{ gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Units • {yearId}</h3>
            <button className="btn btn-primary" onClick={() => setUnitForm({})}>Add Unit</button>
          </div>
          <div className="grid grid-2">
            {[1, 2, 3, 4, 5].map((n) => {
              const u = units.find((x) => Number(x.unitNumber) === n);
              return (
                <div key={n} className="card">
                  <div style={{ fontWeight: 700 }}>Unit {n}</div>
                  <div style={{ fontSize: 14, color: '#475569' }}>{u ? u.title : 'Not added yet'}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', wordBreak: 'break-all' }}>{u?.pdfLink}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                    <button className="btn btn-primary" onClick={() => setUnitForm(u ? { ...u } : { unitNumber: n })}>{u ? 'Edit / Update' : 'Upload'}</button>
                    {u && <a className="btn btn-secondary" href={u.pdfLink} target="_blank" rel="noreferrer">View</a>}
                    {u && <button className="btn btn-secondary" onClick={() => setDeleteTarget({ collection: 'units', id: u.id })}>Delete</button>}
                  </div>
                </div>
              );
            })}
          </div>
          {units.length === 0 && <EmptyState message="No units added yet. Click Add Unit to create one." />}
        </div>
      )}

      {tab === 'tests' && (
        <div className="grid" style={{ gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Tests • {yearId}</h3>
            <button className="btn btn-primary" onClick={() => setTestForm({})}>Create Test</button>
          </div>
          <div className="grid grid-2">
            {tests.map((t) => (
              <div key={t.id} className="card">
                <div style={{ fontWeight: 700 }}>{t.title}</div>
                <div style={{ fontSize: 13, color: '#475569' }}>Unit {t.unitNumber} • {t.questions?.length || 0} questions</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{t.updatedAt?.toDate ? t.updatedAt.toDate().toLocaleDateString() : ''}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  <button className="btn btn-primary" onClick={() => setViewTest(t)}>View</button>
                  <button className="btn btn-secondary" onClick={() => setTestForm({ ...t })}>Edit / Update</button>
                  <button className="btn btn-secondary" onClick={() => setDeleteTarget({ collection: 'tests', id: t.id })}>Delete</button>
                </div>
              </div>
            ))}
            {tests.length === 0 && <EmptyState message="No tests added yet. Click Create Test to add one." />}
          </div>
        </div>
      )}

      {tab === 'students' && (
        <div className="grid" style={{ gap: 12 }}>
          <input className="input" placeholder="Search student" value={searchStudent} onChange={(e) => setSearchStudent(e.target.value)} />
          <div className="table-scroll">
            <table className="table progress-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Year</th><th>Joined</th></tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr key={s.uid || s.id}>
                    <td>{s.name}</td>
                    <td className="email-cell">{s.email}</td>
                    <td>{s.year}</td>
                    <td>{s.createdAt?.toDate ? s.createdAt.toDate().toLocaleDateString() : ''}</td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && <tr><td colSpan={4}>No students found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'reports' && (
        <div className="grid" style={{ gap: 12 }}>
          <div className="grid grid-3" style={{ gap: 10 }}>
            <input className="input" placeholder="Search student" value={searchReport} onChange={(e) => setSearchReport(e.target.value)} />
            <select className="input" value={filterTest} onChange={(e) => setFilterTest(e.target.value)}>
              <option value="">All tests</option>
              {tests.map((t) => <option key={t.id} value={t.title}>{t.title}</option>)}
            </select>
            <div />
          </div>
          <div className="table-scroll">
            <table className="table progress-table">
              <thead>
                <tr><th>Student</th><th>Test</th><th>Score</th><th>Total</th><th>Date</th></tr>
              </thead>
              <tbody>
                {filteredReports.map((r) => (
                  <tr key={r.id}>
                    <td>{r.studentName}</td>
                    <td>{r.testTitle}</td>
                    <td>{r.score}</td>
                    <td>{r.total}</td>
                    <td>{r.submittedAt?.toDate ? r.submittedAt.toDate().toLocaleString() : ''}</td>
                  </tr>
                ))}
                {filteredReports.length === 0 && <tr><td colSpan={5}>No reports yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'tasks' && (
        <div className="grid" style={{ gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Tasks • {yearId}</h3>
            <button className="btn btn-primary" onClick={() => setTaskForm({})}>Add Task</button>
          </div>
          <div className="grid grid-2">
            {tasks.map((t) => (
              <div key={t.id} className="card">
                <div style={{ fontWeight: 700 }}>{t.title}</div>
                <div style={{ fontSize: 13, color: '#475569', marginBottom: 4 }}>{t.description}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>Due: {t.dueDate || 'N/A'}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>Status: {t.status || 'active'}</div>
                {t.fileLink && <a className="btn btn-secondary" style={{ marginTop: 6 }} href={t.fileLink} target="_blank" rel="noreferrer">Open Link</a>}
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button className="btn btn-primary" onClick={() => setTaskForm({ ...t })}>Edit / Update</button>
                  <button className="btn btn-secondary" onClick={() => setDeleteTarget({ collection: 'tasks', id: t.id })}>Delete</button>
                </div>
              </div>
            ))}
            {tasks.length === 0 && <EmptyState message="No tasks yet. Click Add Task to create one." />}
          </div>
        </div>
      )}

      <UnitFormModal
        open={!!unitForm}
        initial={unitForm && unitForm.id ? unitForm : null}
        year={yearId}
        onClose={() => setUnitForm(null)}
        onSave={saveUnit}
      />
      <TestFormModal
        open={!!testForm}
        initial={testForm && testForm.id ? testForm : null}
        year={yearId}
        onClose={() => setTestForm(null)}
        onSave={saveTest}
      />
      <TestViewModal open={!!viewTest} test={viewTest} onClose={() => setViewTest(null)} />
      <TaskFormModal
        open={!!taskForm}
        initial={taskForm && taskForm.id ? taskForm : null}
        year={yearId}
        onClose={() => setTaskForm(null)}
        onSave={saveTask}
      />
      <ConfirmDeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteUnit}
        text="Are you sure you want to delete this item?"
      />
    </div>
  );
};

export default AdminYear;
