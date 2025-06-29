import React from "react";
import { useNavigate } from "react-router-dom";

function TermSetup({ onStart }) {
  console.log("TermSetup is rendering");
  const navigate = useNavigate();

  const handleFileLoad = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        let rows = [];
        let meta = { term: "", group: "", theme: "" };
        if (Array.isArray(data)) {
          rows = data;
        } else if (data.rows && Array.isArray(data.rows)) {
          rows = data;
          meta = data.meta || meta;
        } else {
          alert("Invalid file format");
          return;
        }

        onStart({
          rows,
          meta,
          startDate: meta.startDate ? new Date(meta.startDate) : null,
          endDate: meta.endDate ? new Date(meta.endDate) : null,
          stdDOW: meta.stdDOW || "",
          startTime: meta.startTime || "",
          endTime: meta.endTime || "",
        });

        navigate("/planner");
      } catch (err) {
        alert("Could not read JSON file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <button onClick={() => navigate("/new-term")}>
        Start New Term
      </button>
      <label style={{ marginLeft: "1rem" }}>
        Load Term from File:
        <input type="file" accept="application/json" onChange={handleFileLoad} />
      </label>
    </div>
  );
}

export default TermSetup;
