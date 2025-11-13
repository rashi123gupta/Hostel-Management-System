"use client";

import React, { useEffect, useState } from "react";
// --- MODIFICATION: Remove direct Firebase imports ---
// import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
// import { db } from "../../../services/firebase";
// --- MODIFICATION: Import the new service function ---
import { onMessMenuChange } from "../../../services/messMenuService";
import "../../../styles/global.css";
import AddSuggestionModal from "../../../components/AddSuggestionModal";

export default function StudentMessMenu() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  // --- MODIFICATION: Added error state ---
  const [error, setError] = useState(null);

  const formatDateForDisplay = (dateValue) => {
    if (dateValue && typeof dateValue === 'object' && dateValue.toDate) {
      return dateValue.toDate().toLocaleDateString('en-GB'); // Format as DD/MM/YYYY
    }
    if (typeof dateValue === 'string') {
      return dateValue;
    }
    return 'N/A';
  };

  // --- MODIFICATION: useEffect now uses the service function ---
  useEffect(() => {
    setLoading(true);
    
    // Call the listener from the service, passing callbacks
    const unsubscribe = onMessMenuChange(
      (menuList) => {
        // Success callback
        setMenu(menuList);
        setLoading(false);
      },
      (err) => {
        // Error callback
        console.error(err);
        setError("Failed to load mess menu. Please try again later.");
        setLoading(false);
      }
    );

    // Return the unsubscribe function for cleanup
    return () => unsubscribe();
  }, []);

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
        <h2>Weekly Mess Menu</h2>
        <button
          className="btn-primary"
          onClick={() => setShowModal(true)}>
          Add Suggestion
        </button>
      </div>

      {/* --- MODIFICATION: Show error if one occurs --- */}
      {error && <p className="error-message">{error}</p>}

      {!error && (
        <div className="card-list">
          {menu.map((item) => (
            <div className="card" key={item.id}>
              <h3>{item.dayName}</h3>

              <p><strong>Breakfast:</strong> {item.breakfast}</p>
              <p><strong>Lunch:</strong> {item.lunch}</p>
              <p><strong>Snacks:</strong> {item.snacks}</p>
              <p><strong>Dinner:</strong> {item.dinner}</p>

              <p className="updated-at">
                Updated At:{" "}{formatDateForDisplay(item.updatedAt)}
              </p>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <AddSuggestionModal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}