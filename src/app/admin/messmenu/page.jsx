"use client";

import React, { useEffect, useState } from "react";
// --- MODIFICATION: Remove direct Firebase imports ---
// import { collection, query, orderBy, onSnapshot, updateDoc, doc } from "firebase/firestore";
// import { db } from "../../../services/firebase";
// --- MODIFICATION: Import the new service function ---
import { onMessMenuChange } from "../../../services/messMenuService";
import "../../../styles/global.css";
import WardenUpdateMenuModal from "../../../components/WardenUpdateMenuModal";

export default function WardenMessMenu() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  // --- MODIFICATION: Added error state ---
  const [error, setError] = useState(null);

  const formatDateForDisplay = (dateValue) => {
    if (dateValue && typeof dateValue === 'object' && dateValue.toDate) {
      return dateValue.toDate().toLocaleDateString('en-GB'); // Format as DD/MM/YYYY
    }
// ... (existing code is correct) ...
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
        {/* --- MODIFICATION: Use 'loading' class for consistency --- */}
        <h2 className="loading">Loading Mess Menu...</h2>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Weekly Mess Menu</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          Update Mess Menu
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
        <WardenUpdateMenuModal
          menu={menu}
          onClose={() => setShowModal(false)}
          // We will need to update this modal next,
          // as it still contains direct Firebase calls.
        />
      )}
    </div>
  );
}