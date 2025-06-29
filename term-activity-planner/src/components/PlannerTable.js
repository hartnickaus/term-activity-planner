import React, { useState, useEffect } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

function generateWeeklyDates(startDate, endDate, stdDOW) {
  const result = [];

  console.log(stdDOW)
  console.log(startDate)

  if (!stdDOW || typeof stdDOW !== "string") {
    console.warn("Invalid stdDOW:", stdDOW);
    return result;
  }

  const targetDOW = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(stdDOW);

  if (targetDOW === -1) {
    console.warn("Could not find day in list:", stdDOW);
    return result;
  }

  const current = new Date(startDate);

  // Adjust to first matching weekday
  while (current.getDay() !== targetDOW) {
    current.setDate(current.getDate() + 1);
  }

  while (current <= endDate) {
    result.push(new Date(current));
    current.setDate(current.getDate() + 7);
  }

  return result;
}

function formatTime(time24) {
  if (!time24) return "";
  const [hour, min] = time24.split(":");
  let h = parseInt(hour);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${min} ${ampm}`;
}

const headers = ["Start Date", "End Date", "Activity Name", "Lead", "Assist", "Notes", "Challenge Area", "RA", "OOH", "EB"];

const challengeOptions = ["Community", "Creative", "Outdoors", "Personal Growth"];

function PlannerTable({ startDate, endDate, stdDOW, startTime, endTime, loadedRows = null, meta: initialMeta = null, onBack }) {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({
    term: "",
    group: "",
    theme: "",
    stdDOW: "",
    startTime: "",
    endTime: ""
  });

  useEffect(() => {
    if (loadedRows) {
      let rowsData = [];
      if (Array.isArray(loadedRows)) {
        rowsData = loadedRows;
      } else if (loadedRows.rows) {
        rowsData = loadedRows.rows;
      }
      const sorted = [...rowsData].sort((a, b) => new Date(a[0]) - new Date(b[0]));
      setRows(sorted);
    } else if (startDate && endDate && stdDOW) {
      console.log("Generating dates for:", startDate, endDate, stdDOW);
      const dates = generateWeeklyDates(startDate, endDate, stdDOW);
      const initialRows = dates.map((date) => [
        date.toISOString().split("T")[0], "", "", "", "", "", "", "false", "false", "false"
      ]);
      setRows(initialRows);
    }
  }, [startDate, endDate, loadedRows, stdDOW]);

  useEffect(() => {
    if (initialMeta) {
      setMeta(initialMeta);
    }
  }, [initialMeta]);

  const handleChange = (rowIndex, colIndex, value) => {
    const updated = [...rows];
    updated[rowIndex][colIndex] = value;
    setRows(updated);
  };

  const addRow = () => {
    const emptyRow = Array(headers.length).fill("");
    setRows([...rows, emptyRow]);
  };

  const deleteRow = (index) => {
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);
  };

  const saveAsJSON = async () => {
    const completeMeta = {
      ...meta,
      startDate: startDate ? new Date(startDate).toISOString() : "",
      endDate: endDate ? new Date(endDate).toISOString() : "",
      stdDOW,
      startTime,
      endTime,
    };

    const data = {
      meta: completeMeta,
      rows,
    };

    if ('showSaveFilePicker' in window) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: "term-activity-planner.json",
          types: [{ description: "JSON Files", accept: { "application/json": [".json"] } }],
        });

        const writable = await handle.createWritable();
        await writable.write(JSON.stringify(data, null, 2));
        await writable.close();
        alert("File saved successfully!");
        return;
      } catch (err) {
        console.warn("File Picker canceled or failed", err);
      }
    }

    // Fallback
    const filename = prompt("Enter filename to save:", "term-activity-planner.json");
    if (!filename) return;

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveAsExcel = async () => {

    // Load up images
    const logoImageBuffer = await fetch("/logo192.png")
      .then(res => res.arrayBuffer())
      .then(buffer => new Uint8Array(buffer));
    
    // set some excel constants
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Planner");


    // Human summary rows
    const summary1 = `Overview for ${meta.group} for ${meta.term} with a theme of ${meta.theme}`;
    const summary2 = `Weekly Nights are set as ${stdDOW?.slice(0, 3)} ${startTime} to ${endTime}`;
    sheet.mergeCells("A1", "J1");
    sheet.mergeCells("A2", "J2");
    const summaryCell = sheet.getCell("A1");
    summaryCell.value = summary1;
    summaryCell.font = { bold: true, size: 14 };
    summaryCell.alignment = { vertical: "middle", horizontal: "center" };
    summaryCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDDEEFF" } };

    const summaryCell2 = sheet.getCell("A2")
    summaryCell2.value = summary2;

    // Add ScoutLogo
    const imageId = workbook.addImage({
      buffer: logoImageBuffer,
      extension: "png",
    });

    sheet.addImage(imageId, {
      tl: { col: 0, row: 0 },
      ext: { width: 120, height: 120 },
    });

    // Header row
    const headers = ["Start Date", "End Date", "Activity Name", "Lead", "Assist", "Notes", "Challenge Area", "RA", "OOH", "EB"];
    sheet.addRow(headers);
    const headerRow = sheet.getRow(3);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0070C0" } };
      cell.alignment = { horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Data rows
    rows.forEach((row, idx) => {
      const transformedRow = row.map((val, i) => {
        const isBooleanCol = i >= headers.length - 3;
        return isBooleanCol ? (val === "true" ? "Yes" : "No") : val;
      });

      const newRow = sheet.addRow(transformedRow);
      newRow.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Zebra striping
      if (idx % 2 === 0) {
        newRow.eachCell((cell) => {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2F2F2" } };
        });
      }
    });

    // Auto width
    sheet.columns.forEach((col) => {
      let maxLength = 10;
      col.eachCell({ includeEmpty: true }, (cell) => {
        if (cell.row <= 2) return;
        const val = cell.value?.toString() || "";
        if (val.length > maxLength) maxLength = val.length;
      });
      col.width = maxLength + 2;
    });

    // Export
    const buf = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buf]), "Term-Activity-Planner.xlsx");
  };

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <button onClick={addRow}>Add Row</button>
        <button onClick={() => {
            const sorted = [...rows].sort((a, b) => new Date(a[0]) - new Date(b[0]));
            setRows(sorted);
          }}>
          Sort by Date
        </button>
        <button onClick={saveAsJSON}>Save as JSON</button>
        <button onClick={saveAsExcel}>Create Excel</button>
        <button onClick={onBack}>Back</button>
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ marginLeft: "1rem" }}>
          Term:
          <input
            type="text"
            value={meta.term}
            onChange={(e) => setMeta({ ...meta, term: e.target.value })}
          />
        </label>
        <label style={{ marginLeft: "1rem" }}>
          Group/Section:
          <input
            type="text"
            value={meta.group}
            onChange={(e) => setMeta({ ...meta, group: e.target.value })}
          />
        </label>
        <label style={{ marginLeft: "1rem" }}>
          Theme:
          <input
            type="text"
            value={meta.theme}
            onChange={(e) => setMeta({ ...meta, theme: e.target.value })}
          />
        </label>
        <label style={{ marginLeft: "1rem" }}>
          Regular Weekly Night is {stdDOW?.slice(0, 3)}{" "} {startTime && endTime ? `${formatTime(startTime)} to ${formatTime(endTime)}` : ""}
        </label>
      </div>
      <table>
        <thead>
          <tr>
            {headers.map((h) => <th key={h}>{h}</th>)}
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
            {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>

                  {row.map((val, colIndex) => {
                    const isBooleanColumn = colIndex >= headers.length - 3;
                    const isChallengeArea = colIndex === 6;

                    return (
                      <td key={colIndex}>
                        {isChallengeArea ? (
                          <select
                            value={val}
                            onChange={(e) => handleChange(rowIndex, colIndex, e.target.value)}
                          >
                            <option value="">-- Select --</option>
                            {challengeOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : isBooleanColumn ? (
                          <input
                            type="checkbox"
                            checked={val === "true"}
                            onChange={(e) =>
                              handleChange(rowIndex, colIndex, e.target.checked ? "true" : "false")
                            }
                          />
                        ) : (
                          <input
                            type={colIndex === 0 || colIndex === 1 ? "date" : "text"}
                            value={val}
                            onChange={(e) => handleChange(rowIndex, colIndex, e.target.value)}
                          />
                        )}
                      </td>
                    );
                  })}
                  <td>
                      <button onClick={() => deleteRow(rowIndex)}>🗑</button>
                  </td>
                </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default PlannerTable;
