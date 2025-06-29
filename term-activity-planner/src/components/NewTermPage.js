// src/NewTermPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function NewTermPage({ onStart }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [stdDOW, setStdDOW] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const navigate = useNavigate();

  const handleStart = () => {
    if (!startDate || !endDate) return alert("Please enter both dates");
    if (!stdDOW) return alert("Please select a day of the week.");
    if (new Date(startDate) > new Date(endDate)) return alert("Start date must be before end date");

    onStart({ 
      startDate: new Date(startDate), 
      endDate: new Date(endDate), 
      stdDOW, 
      startTime, 
      endTime 
    });

    navigate("/planner")
  };

  return (
    <div>
      <h2>Create a New Term</h2>
      <table>
        <tr><th colSpan="2"><h3>Term Dates</h3></th></tr>
        <tr>
          <td>Start</td><td><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></td>
        </tr>
        <tr>
          <td>End </td><td><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></td>
        </tr>
        <tr><th colSpan="2"><h3>Regular Weekly Meeting</h3></th></tr>
        <tr>
          <td> Day of week</td>
          <td>
            <select value={stdDOW} onChange={(e) => setStdDOW(e.target.value)}>
              <option value="">-- Select Day --</option>
              <option value="Sunday">Sunday</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
            </select>
          </td>
        </tr>
        <tr>
          <td>Start Time</td><td><input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></td>
        </tr>
        <tr>
          <td>End Time</td><td><input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></td>
        </tr>
      </table>
      <br />
      <button onClick={handleStart}>Create Planner</button>
    </div>
  );
}

export default NewTermPage;
