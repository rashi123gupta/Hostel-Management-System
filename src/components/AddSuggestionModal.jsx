// src/components/AddSuggestionModal.jsx

import React, { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";

export default function AddSuggestionModal({ onClose }) {
  const { userProfile } = useAuth();

  const [formData, setFormData] = useState({
    breakfast: "",
    lunch: "",
    snacks: "",
    dinner: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // ⛔ STOP form from closing or refreshing

    const allEmpty =
      !formData.breakfast.trim() &&
      !formData.lunch.trim() &&
      !formData.snacks.trim() &&
      !formData.dinner.trim();

    if (allEmpty) {
      alert(
        "All fields cannot be empty. Please enter at least one suggestion."
      );
      return; // ⛔ DO NOT close modal, DO NOT submit
    }
    setLoading(true);

    try {
      await addDoc(collection(db, "messSuggestions"), {
        ...formData,
        studentId: userProfile?.uid || "",
        studentName: userProfile?.name || "Anonymous",
        rollNo: userProfile?.rollNo || "",
        status: "Pending",
        submittedAt: serverTimestamp(),
      });

      alert("Suggestion submitted successfully!");
      onClose();
    } catch (err) {
      console.error("Error submitting suggestion:", err);
      alert("Failed to submit suggestion.");
    }

    setLoading(false);
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Add Mess Menu Suggestion</h3>

        <form className="modal-form-body" onSubmit={handleSubmit}>
          <label>Breakfast Suggestion</label>
          <textarea
            name="breakfast"
            className="form-input"
            placeholder="Enter breakfast suggestion"
            value={formData.breakfast}
            onChange={handleChange}
          />

          <label>Lunch Suggestion</label>
          <textarea
            name="lunch"
            className="form-input"
            placeholder="Enter lunch suggestion"
            value={formData.lunch}
            onChange={handleChange}
          />

          <label>Snacks Suggestion</label>
          <textarea
            name="snacks"
            className="form-input"
            placeholder="Enter snacks suggestion"
            value={formData.snacks}
            onChange={handleChange}
          />

          <label>Dinner Suggestion</label>
          <textarea
            name="dinner"
            className="form-input"
            placeholder="Enter dinner suggestion"
            value={formData.dinner}
            onChange={handleChange}
          />

          <div className="modal-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </button>

            <button type="button" className="btn-close-modal" onClick={onClose}>
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
