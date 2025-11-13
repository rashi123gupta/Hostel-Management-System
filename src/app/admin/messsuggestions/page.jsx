"use client";

import React, { useEffect, useMemo, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../../services/firebase";
import "../../../styles/global.css";

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


export default function WardenMessSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const q = query(
      collection(db, "messSuggestions"),
      orderBy("submittedAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => {
          const data = d.data();

          let submittedDate = "-";
          if (data.submittedAt) {
            if (typeof data.submittedAt.toDate === "function") {
              submittedDate = data.submittedAt.toDate().toLocaleString();
            } else if (typeof data.submittedAt === "string") {
              submittedDate = data.submittedAt;
            }
          }

          return {
            id: d.id,
            ...data,
            submittedAt: data.submittedAt || null,
          };
        });

        setSuggestions(list);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching suggestions:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filtered suggestions derived from suggestions + filter
  const filtered = useMemo(() => {
    if (filter === "all") return suggestions;

    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    let threshold = null;

    if (filter === "today") {
      threshold = startOfToday;
      return suggestions.filter((s) => {
        const d = toDateSafe(s.submittedAt);
        return d && d >= threshold && d <= now;
      });
    }

    if (filter === "7") {
      threshold = new Date(now);
      threshold.setDate(now.getDate() - 7);
    } else if (filter === "30") {
      threshold = new Date(now);
      threshold.setDate(now.getDate() - 30);
    }

    return suggestions.filter((s) => {
      const d = toDateSafe(s.submittedAt);
      return d && d >= threshold && d <= now;
    });
  }, [suggestions, filter]);

  if (loading) {
    return (
      <div className="page-container">
        <h2 className="page-title">Loading Suggestions...</h2>
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

      <div className="card" style={{ overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Student Name</th>
              <th>Roll No</th>
              <th>Breakfast</th>
              <th>Lunch</th>
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
                  <td>
                    {toDateSafe(item.submittedAt)
                      ? toDateSafe(item.submittedAt).toLocaleString()
                      : "-"}
                  </td>
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
    </div>
  );
}
