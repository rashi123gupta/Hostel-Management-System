// src/components/AddSuggestionModal.jsx

import React, { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";

export default function AddSuggestionModal({ onClose }) {
  const { userProfile } = useAuth();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    breakfast: "",
    lunch: "",
    snacks: "",
    dinner: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      // await addDoc(collection(db, "messSuggestions"), {
      //   ...formData,
      //   studentId: userProfile?.uid || "",
      //   studentName: userProfile?.name || "Anonymous",
      //   rollNo: userProfile?.rollNo || "",
      //   status: "Pending",
      //   submittedAt: serverTimestamp(),
      // });
      const docRef = await addDoc(collection(db, "messSuggestions"), {
        ...formData,
        studentId: userProfile?.uid || "",
        studentName: userProfile?.name || "Anonymous",
        rollNo: userProfile?.rollNo || "",
        status: "Pending",
        submittedAt: serverTimestamp(),
      });
      // Force Firestore to update local cache after timestamp resolves
      await new Promise((resolve) => setTimeout(resolve, 500));

      alert("Suggestion submitted successfully!");
      onClose();
    } catch (err) {
      console.error("Error submitting suggestion:", err);
      alert("Failed to submit suggestion. Check console for details.");
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Add Mess Menu Suggestion</h3>

        <div className="modal-form-body">
          {step === 1 && (
            <>
              <label>Breakfast Suggestion</label>
              <textarea
                className="form-input"
                name="breakfast"
                value={formData.breakfast}
                onChange={handleChange}
                placeholder="Enter breakfast suggestion"
              />
            </>
          )}

          {step === 2 && (
            <>
              <label>Lunch Suggestion</label>
              <textarea
                className="form-input"
                name="lunch"
                value={formData.lunch}
                onChange={handleChange}
                placeholder="Enter lunch suggestion"
              />
            </>
          )}

          {step === 3 && (
            <>
              <label>Snacks Suggestion</label>
              <textarea
                className="form-input"
                name="snacks"
                value={formData.snacks}
                onChange={handleChange}
                placeholder="Enter snacks suggestion"
              />
            </>
          )}

          {step === 4 && (
            <>
              <label>Dinner Suggestion</label>
              <textarea
                className="form-input"
                name="dinner"
                value={formData.dinner}
                onChange={handleChange}
                placeholder="Enter dinner suggestion"
              />
            </>
          )}
        </div>

        <div className="modal-actions">
          {step > 1 && (
            <button
              className="btn-prev-modal"
              onClick={() => setStep(step - 1)}
            >
              Previous
            </button>
          )}
          {step < 4 && (
            <button
              className="btn-next-modal"
              onClick={() => setStep(step + 1)}
            >
              Next
            </button>
          )}
          {step === 4 && (
            <button className="btn-primary" onClick={handleSubmit}>
              Submit
            </button>
          )}
          <button className="btn-close-modal" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
