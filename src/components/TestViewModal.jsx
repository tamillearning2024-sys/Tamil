import React from 'react';

const TestViewModal = ({ open, onClose, test }) => {
  if (!open || !test) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', overflowY: 'auto', zIndex: 50 }}>
      <div style={{ maxWidth: 720, margin: '40px auto', padding: '0 16px' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>{test.title}</h3>
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
          <div style={{ color: '#475569', marginBottom: 8 }}>Unit {test.unitNumber}</div>
          {(test.questions || []).map((q, idx) => (
            <div key={idx} style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 700 }}>{idx + 1}. {q.questionText}</div>
              {q.options?.map((opt, oi) => (
                <div key={oi} style={{ padding: '4px 0', color: q.correctAnswer === oi ? '#16a34a' : '#0f172a' }}>
                  {opt} {q.correctAnswer === oi ? '✓' : ''}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestViewModal;
