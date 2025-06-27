import React, { useState } from "react";
import "./App.css";

function App() {
  const headers = [
    "Date",
    "Activity",
    "Lead",
    "Assist",
    "Challange Area",
    "RA",
    "OOH",
    "EB"
  ];

  const [rows, setRows] = useState([
    Array(headers.length).fill("")
  ]);

  const handleChange = (rowIndex, colIndex, value) => {
    const newRows = [...rows];
    newRows[rowIndex][colIndex] = value;
    setRows(newRows);
  };

  const addRow = () => {
    setRows([...rows, Array(headers.length).fill("")]);
  };

  return (
    <div className="App">
      <h1>Term Activity Planner</h1>
      <p>Create basic plan for the term</p>
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((val, colIndex) => (
                <td key={colIndex}>
                  <input
                    type="text"
                    value={val}
                    onChange={(e) =>
                      handleChange(rowIndex, colIndex, e.target.value)
                    }
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={addRow}>Add Row</button>
    </div>
  );
}

export default App;
