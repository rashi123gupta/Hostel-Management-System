import './App.css';
import { useState } from "react";
import Dashboard from "./HMS/Dashboard";
import Leave from "./HMS/Leave";
import Complaints from "./HMS/Complaints";

export default function App() {
  const [page, setPage] = useState("dashboard");

  function renderPage() {
    if (page === "dashboard") return <Dashboard />;
    if (page === "leave") return <Leave />;
    if (page === "complaints") return <Complaints />;
  }

  return (
    <div>
      <nav style={{ background: "#454b59ff", padding: "10px", color: "white" }}>
        <span style={{ marginRight: "20px", fontWeight: "bold" }}><img src="./HMS/logo.jpg" /></span>
        <button onClick={() => setPage("dashboard")}>Dashboard</button>
        <button onClick={() => setPage("leave")}>Leave</button>
        <button onClick={() => setPage("complaints")}>Complaints</button>
      </nav>

      <div style={{ padding: "20px" }}>
        {renderPage()}
      </div>
    </div>
  );
}
