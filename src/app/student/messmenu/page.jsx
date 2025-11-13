"use client";

import React, { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../../services/firebase";
import "../../../styles/global.css";
import AddSuggestionModal from "../../../components/AddSuggestionModal";

export default function StudentMessMenu() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "messMenu"), orderBy("dayIndex", "asc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMenu(list);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <h2 className="page-title">Loading Menu...</h2>
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

      <div className="card-list">
        {menu.map((item) => (
          <div className="card" key={item.id}>
            <h3>{item.dayName}</h3>

            <p><strong>Breakfast:</strong> {item.breakfast}</p>
            <p><strong>Lunch:</strong> {item.lunch}</p>
            <p><strong>Snacks:</strong> {item.snacks}</p>
            <p><strong>Dinner:</strong> {item.dinner}</p>

            <p className="updated-at">
              Updated At:{" "}
              {item.updatedAt
                ? new Date(item.updatedAt).toLocaleString()
                : "No timestamp"}
            </p>
          </div>
        ))}
      </div>

      {showModal && (
        <AddSuggestionModal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
