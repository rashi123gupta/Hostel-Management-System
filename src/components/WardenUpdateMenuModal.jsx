import React, { useState } from "react";
import { db } from "../services/firebase";
import { updateDoc, doc, serverTimestamp } from "firebase/firestore";

export default function WardenUpdateMenuModal({ menu, onClose }) {
  const [step, setStep] = useState(0); // 0: breakfast, 1: lunch, etc.
  const [formData, setFormData] = useState({
    breakfast: "",
    lunch: "",
    snacks: "",
    dinner: "",
    dayId: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 3));
  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.dayId) {
        alert("Please select a day to update.");
        setLoading(false);
        return;
      }

      const docRef = doc(db, "messMenu", formData.dayId);

      // Only update filled fields
      const updatedFields = {};
      ["breakfast", "lunch", "snacks", "dinner"].forEach((key) => {
        if (formData[key].trim()) updatedFields[key] = formData[key];
      });

      updatedFields.updatedAt = serverTimestamp();

      await updateDoc(docRef, updatedFields);

      alert("Menu updated successfully!");
      onClose();
    } catch (err) {
      console.error("Error updating menu:", err);
      alert("Failed to update menu.");
    }

    setLoading(false);
  };

  const stepNames = ["Breakfast", "Lunch", "Snacks", "Dinner"];

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Update Mess Menu</h3>
        <form className="modal-form-body" onSubmit={handleSubmit}>
          {step === 0 && (
            <>
              <label>Select Day:</label>
              <select
                name="dayId"
                className="form-input"
                value={formData.dayId}
                onChange={handleChange}
                required
              >
                <option value="">Select a Day</option>
                {menu.map((day) => (
                  <option key={day.id} value={day.id}>
                    {day.dayName}
                  </option>
                ))}
              </select>
            </>
          )}

          <label>{stepNames[step]}:</label>
          <textarea
            name={["breakfast", "lunch", "snacks", "dinner"][step]}
            className="form-input"
            placeholder={`Enter New ${stepNames[step]} (leave blank if no updates)`}
            value={formData[["breakfast", "lunch", "snacks", "dinner"][step]]}
            onChange={handleChange}
          />

          <div className="modal-actions">
            {step > 0 && (
              <button
                type="button"
                className="btn-prev-modal"
                onClick={handlePrev}
              >
                Previous
              </button>
            )}

            {step < 3 && (
              <button
                type="button"
                className="btn-next-modal"
                onClick={handleNext}
              >
                Next
              </button>
            )}

            {step === 3 && (
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Updating..." : "Submit"}
              </button>
            )}

            <button type="button" className="btn-close-modal" onClick={onClose}>
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
