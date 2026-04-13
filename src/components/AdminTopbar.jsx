import React from "react";
import tu from "../../assest/TU.png";
import av from "../../assest/av logo.jpg";
import fp from "../../assest/faceprep.png";
import KuralHeader from "./KuralHeader";

const AdminTopbar = ({ onMenu, showMenu = true }) => {
  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {showMenu && (
          <button className="hamburger" onClick={onMenu} aria-label="Toggle sidebar">
            <span />
            <span />
            <span />
          </button>
        )}
        <div className="header-logos">
          <div className="logo-chip"><img src={tu} alt="TU logo" /></div>
          <div className="logo-chip"><img src={av} alt="AV logo" /></div>
          <div className="logo-chip"><img src={fp} alt="Faceprep logo" /></div>
        </div>
      </div>
      <div className="kural-wrap"><KuralHeader /></div>
    </div>
  );
};

export default AdminTopbar;
