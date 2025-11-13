// src/app/student/messmenu/page.jsx

"use client";

import React, { useEffect, useState } from "react";
import { onMessMenuChange } from "../../../services/messMenuService";
import "../../../styles/global.css";
import AddSuggestionModal from "../../../components/AddSuggestionModal";

export default function StudentMessMenu() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);

  // ⭐ NEW: Dropdown filter state
  const [selectedDay, setSelectedDay] = useState("ALL");

  const formatDateForDisplay = (dateValue) => {
    if (dateValue && typeof dateValue === 'object' && dateValue.toDate) {
      return dateValue.toDate().toLocaleDateString('en-GB');
    }
    if (typeof dateValue === 'string') return dateValue;
    return 'N/A';
  };

  useEffect(() => {
    setLoading(true);

    const unsubscribe = onMessMenuChange(
      (menuList) => {
        setMenu(menuList);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError("Failed to load mess menu. Please try again later.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // ⭐ NEW: Apply day filter
  const filteredMenu =
    selectedDay === "ALL"
      ? menu
      : menu.filter(
          (item) => item.dayName?.toUpperCase() === selectedDay
        );

  if (loading) {
    return (
      <div className="page-container">
        <h2 className="loading">Loading Menu...</h2>
      </div>
    );
  }

  return (
    <div className="page-container">
      
      <div className="page-header">

        <h1>Weekly Mess Menu</h1>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <select
          className="status-filter-select"
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          style={{ width: "160px" }}
        >
          <option value="ALL">All Days</option>
          <option value="MONDAY">Monday</option>
          <option value="TUESDAY">Tuesday</option>
          <option value="WEDNESDAY">Wednesday</option>
          <option value="THURSDAY">Thursday</option>
          <option value="FRIDAY">Friday</option>
          <option value="SATURDAY">Saturday</option>
          <option value="SUNDAY">Sunday</option>
        </select>

        {/* ⬆️ Filtering does NOT remove Add Suggestion button */}
        <button
          className="btn-primary"
          onClick={() => setShowModal(true)}
        >
          Add Suggestion
        </button>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      {!error && (
        <div className="card-list">

          {filteredMenu.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
              No menu found.
            </div>
          ) : (
            filteredMenu.map((item) => (
              <div className="card" key={item.id}>
                <h3>{item.dayName}</h3>

                <p><strong>Breakfast:</strong> {item.breakfast}</p>
                <p><strong>Lunch:</strong> {item.lunch}</p>
                <p><strong>Snacks:</strong> {item.snacks}</p>
                <p><strong>Dinner:</strong> {item.dinner}</p>

                <p className="updated-at">
                  Updated At: {formatDateForDisplay(item.updatedAt)}
                </p>
              </div>
            ))
          )}

        </div>
      )}

      {showModal && (
        <AddSuggestionModal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
