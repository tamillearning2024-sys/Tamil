import React, { useEffect, useState } from 'react';

const emptyQuestion = () => ({
  questionText: '',
  options: ['', '', '', ''],
  correctAnswer: 0
});

const TestFormModal = ({ open, onClose, onSave, initial, year }) => {
  const [form, setForm] = useState(initial || { title: '', unitNumber: 1, questions: [emptyQuestion()] });

  useEffect(() => {
    setForm(initial || { title: '', unitNumber: 1, questions: [emptyQuestion()] });
  }, [initial]);

  if (!open) return null;

  const addQuestion = () => setForm({ ...form, questions: [...form.questions, emptyQuestion()] });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', overflowY: 'auto', zIndex: 50 }}>
      <div style={{ maxWidth: 720, margin: '40px auto', padding: '0 16px' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>{initial ? 'Update Test' : 'Create Test'}</h3>
            <div className="pill">{year}</div>
          </div>
          <div className="grid" style={{ gap: 10, marginTop: 12 }}>
            <input className="input" placeholder="Test title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <select className="input" value={form.unitNumber} onChange={(e) => setForm({ ...form, unitNumber: Number(e.target.value) })}>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>Unit {n}</option>)}
            </select>
            {form.questions.map((q, idx) => (
              <div key={idx} className="card" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
                <input className="input" placeholder={`Question ${idx + 1}`} value={q.questionText}
                  onChange={(e) => {
                    const copy = [...form.questions];
                    copy[idx].questionText = e.target.value;
                    setForm({ ...form, questions: copy });
                  }} />
                {q.options.map((opt, oi) => (
                  <div key={oi} style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    <input className="input" placeholder={`Option ${oi + 1}`} value={opt}
                      onChange={(e) => {
                        const copy = [...form.questions];
                        copy[idx].options[oi] = e.target.value;
                        setForm({ ...form, questions: copy });
                      }} />
                    <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <input type="radio" name={`correct-${idx}`} checked={q.correctAnswer === oi}
                        onChange={() => {
                          const copy = [...form.questions];
                          copy[idx].correctAnswer = oi;
                          setForm({ ...form, questions: copy });
                        }} />
                      Correct
                    </label>
                  </div>
                ))}
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={addQuestion}>Add Question</button>
              <div style={{ flex: 1 }} />
              <button className="btn btn-secondary" type="button" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" type="button" onClick={() => onSave(form)}>{initial ? 'Update' : 'Save'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestFormModal;
