import React, { useMemo } from "react";

// ✅ REAL Tamil Thirukkural (2 lines only)
const kurals = [
  `அகர முதல எழுத்தெல்லாம் ஆதி
பகவன் முதற்றே உலகு`,

  `கற்றதனால் ஆய பயனென்கொல் வாலறிவன்
நற்றாள் தொழாஅர் எனின்`,

  `மலர்மிசை ஏகினான் மாணடி சேர்ந்தார்
நிலமிசை நீடுவாழ் வார்`,

  `வேண்டுதல் வேண்டாமை இலானடி சேர்ந்தார்க்கு
யாண்டும் இடும்பை இல`,

  `இருள்சேர் இருவினையும் சேரா இறைவன்
பொருள்சேர் புகழ்புரிந்தார் மாட்டு`
];

const KuralHeader = ({ align = "center" }) => {
  const kural = useMemo(() => {
    const idx = Math.floor(Math.random() * kurals.length);
    return kurals[idx];
  }, []);

  return (
    <div
      className={`kural-box ${
        align === "left" ? "kural-left" : "kural-center"
      } kural-full`}
    >
      <p className="kural-line" style={{ whiteSpace: "pre-line", marginBottom: 0 }}>
        {kural}
      </p>
    </div>
  );
};

export default KuralHeader;
