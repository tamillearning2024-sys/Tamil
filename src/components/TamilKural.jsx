import React, { useEffect } from "react";

const testKural = `??? ???? ????????????? ???
????? ??????? ????`;

const TamilKural = () => {
  useEffect(() => {
    // Debug: verify the value is intact before render
    console.log("Kural value (should be Tamil):", testKural);
  }, []);

  return (
    <div className="card" style={{ maxWidth: 520 }}>
      <h4 style={{ marginTop: 0 }}>Tamil Render Test</h4>
      <p className="kural-line" style={{ whiteSpace: 'pre-line', marginBottom: 0 }}>
        {testKural}
      </p>
    </div>
  );
};

export default TamilKural;
