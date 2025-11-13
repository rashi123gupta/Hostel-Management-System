"use client";

import React, { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "../../../services/firebase";
import "../../../styles/global.css";
import WardenUpdateMenuModal from "../../../components/WardenUpdateMenuModal";

export default function WardenMessMenu() {
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
        <h2 className="page-title">Loading Mess Menu...</h2>
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
        <WardenUpdateMenuModal
          menu={menu}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
