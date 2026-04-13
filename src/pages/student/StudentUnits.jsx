import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";

const StudentUnits = () => {
  const { year } = useParams();
  const [units, setUnits] = useState([]);

  useEffect(() => {
    if (!year) return;
    const load = async () => {
      const q = query(collection(db, "units"), where("year", "==", year));
      const snap = await getDocs(q);
      const list = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      list.sort((a, b) => a.unitNumber - b.unitNumber);
      setUnits(list);
    };
    load();
  }, [year]);

  return (
    <div className="card">
      <h3>Units • {year}</h3>
      <div className="grid grid-2" style={{ gap: 14 }}>
        {units.map((u) => (
          <div key={u.id} className="card unit-card">
            <div className="unit-chip">Unit {u.unitNumber}</div>
            <div className="unit-title">{u.title || "Untitled unit"}</div>
            {u.pdfLink && (
              <a
                className="btn btn-primary card-action"
                href={u.pdfLink}
                target="_blank"
                rel="noreferrer"
              >
                Open PDF
              </a>
            )}
          </div>
        ))}
        {units.length === 0 && <div>No units added yet.</div>}
      </div>
    </div>
  );
};

export default StudentUnits;
