"use client";

import React, { useEffect, useMemo, useState } from "react";
// --- MODIFICATION: Remove direct Firebase imports ---
// import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
// import { db } from "../../../services/firebase";
// --- MODIFICATION: Import the new service function ---
import { onMessSuggestionsChange } from "../../../services/messMenuService";
import "../../../styles/global.css";

// This helper function is fine to keep here as it's specific to this component's logic
function toDateSafe(ts) {
  if (!ts) return null;
  if (typeof ts.toDate === "function") {
    try {
      return ts.toDate();
    } catch {}
  }
  if (typeof ts === "number") return new Date(ts);
  if (typeof ts === "string") {
    const parsed = Date.parse(ts.replace(" at ", " ").replace(" UTC", ""));
    if (!isNaN(parsed)) return new Date(parsed);
  }
  return null;
}

  const formatDate = (timestamp) => {
      if (timestamp && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toLocaleDateString('en-GB'); // DD/MM/YYYY
      }
      return 'N/A';
  };

export default function WardenMessSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  // --- MODIFICATION: Added error state ---
  const [error, setError] = useState(null);

  // --- MODIFICATION: useEffect now uses the service function ---
  useEffect(() => {
    setLoading(true);

    // Call the listener from the service, passing callbacks
    const unsubscribe = onMessSuggestionsChange(
      (suggestionsList) => {
        // Success callback
        setSuggestions(suggestionsList);
        setLoading(false);
      },
      (err) => {
        // Error callback
        console.error("Error fetching suggestions:", err);
        setError("Failed to load suggestions. Please try again later.");
        setLoading(false);
      }
    );

    // Return the unsubscribe function for cleanup
    return () => unsubscribe();
  }, []);

  // Filtered suggestions derived from suggestions + filter
  const filtered = useMemo(() => {
// ... (existing code is correct) ...
    if (filter === "all") return suggestions;

    const now = new Date();
    const startOfToday = new Date(
// ... (existing code is correct) ...
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    let threshold = null;

    if (filter === "today") {
// ... (existing code is correct) ...
      threshold = startOfToday;
      return suggestions.filter((s) => {
        const d = toDateSafe(s.submittedAt);
        return d && d >= threshold && d <= now;
      });
    }

    if (filter === "7") {
// ... (existing code is correct) ...
      threshold = new Date(now);
      threshold.setDate(now.getDate() - 7);
    } else if (filter === "30") {
// ... (existing code is correct) ...
      threshold = new Date(now);
      threshold.setDate(now.getDate() - 30);
    }

    return suggestions.filter((s) => {
// ... (existing code is correct) ...
      const d = toDateSafe(s.submittedAt);
      return d && d >= threshold && d <= now;
    });
  }, [suggestions, filter]);

  if (loading) {
    return (
      <div className="page-container">
        {/* --- MODIFICATION: Use 'loading' class --- */}
        <h2 className="loading">Loading Suggestions...</h2>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ alignItems: "flex-end" }}>
        <h1>Mess Menu Suggestions</h1>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <label style={{ color: "#4a5568", fontWeight: 600 }}>Show:</label>
          <select
            className="status-filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="7">Last 7 Days</option>
            <option value="30">This Month (Last 30 Days)</option>
          </select>
        </div>
      </div>
      {/* --- MODIFICATION: Show error if one occurs --- */}
      {error && <p className="error-message">{error}</p>}

      {!error && (
        <div className="card" style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
{/* ... (existing code is correct) ... */}
                <th>Student Name</th>
                <th>Roll No</th>
                <th>Breakfast</th>
                <th>Lunch</th>
{/* ... (existing code is correct) ... */}
                <th>Snacks</th>
                <th>Dinner</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    No suggestions found for the selected period.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDate(item.submittedAt)}</td>
                    <td>{item.studentName || "-"}</td>
                    <td>{item.rollNo ?? "-"}</td>
                    <td style={{ maxWidth: 300, whiteSpace: "normal" }}>
                      {item.breakfast || "-"}
                    </td>
                    <td style={{ maxWidth: 300, whiteSpace: "normal" }}>
                      {item.lunch || "-"}
                    </td>
                    <td style={{ maxWidth: 200, whiteSpace: "normal" }}>
                      {item.snacks || "-"}
                    </td>
                    <td style={{ maxWidth: 300, whiteSpace: "normal" }}>
                      {item.dinner || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}