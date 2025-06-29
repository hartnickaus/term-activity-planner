import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import TermSetup from "./components/TermSetup";
import NewTermPage from "./components/NewTermPage";
import PlannerTable from "./components/PlannerTable";

function generateWeeklyRows({ startDate, endDate, stdDOW, startTime, endTime }) {
  const result = [];
  const dayIndex = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(stdDOW);
  const current = new Date(startDate);

  while (current.getDay() !== dayIndex) {
    current.setDate(current.getDate() + 1);
  }

  while (current <= new Date(endDate)) {
    result.push([
      current.toISOString().split("T")[0],  // Start Date
      current.toISOString().split("T")[0],  // End Date
      "", "", "", "", "", "false", "false", "false"
    ]);
    current.setDate(current.getDate() + 7);
  }

  return result;
}

function AppWrapper() {
  const [plannerData, setPlannerData] = useState(null);
  const navigate = useNavigate();

  const handleStart = (data) => {
    if (data.rows) {
      // Loaded from file
      setPlannerData(data);
    } else {
      const rows = generateWeeklyRows(data);
      setPlannerData({ rows, meta: data, ...data });
    }
    navigate("/planner");
  };

  return (
    <Routes>
      <Route path="/" element={<TermSetup onStart={handleStart} />} />
      <Route path="/new-term" element={<NewTermPage onStart={handleStart} />} />
      <Route
        path="/planner"
        element={
          plannerData ? (
            <PlannerTable
              startDate={plannerData.startDate}
              endDate={plannerData.endDate}
              stdDOW={plannerData.stdDOW}
              startTime={plannerData.startTime}
              endTime={plannerData.endTime}
              loadedRows={plannerData.rows}
              meta={plannerData.meta}
              onBack={() => navigate("/")}
            />
          ) : (
            <p>No planner data yet.</p>
          )
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <Router basename="/term-activity-planner">
      <div>
        <h1>My Planner App</h1>
        <AppWrapper />
      </div>
    </Router>
  );
}
