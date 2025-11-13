// src/components/WardenUpdateMenuModal.jsx

import React, { useState } from "react";
import { db } from "../services/firebase";
import { updateDoc, doc, serverTimestamp } from "firebase/firestore";

export default function WardenUpdateMenuModal({ menu, onClose }) {
  const [step, setStep] = useState(0); 

  const [mealStep, setMealStep] = useState(0); // 0: breakfast, 1: lunch...

  const [formData, setFormData] = useState({
    breakfast: "",
    lunch: "",
    snacks: "",
    dinner: "",
    dayId: "",
  });

  const [loading, setLoading] = useState(false);

  const stepNames = ["Breakfast", "Lunch", "Snacks", "Dinner"];
  const stepKeys = ["breakfast", "lunch", "snacks", "dinner"];

  const handleFieldChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.dayId) {
        alert("Please select a day first.");
        setLoading(false);
        return;
      }

      const docRef = doc(db, "messMenu", formData.dayId);

      const updated = {};
      stepKeys.forEach((key) => {
        if (formData[key].trim()) updated[key] = formData[key];
      });

      updated.updatedAt = serverTimestamp();

      await updateDoc(docRef, updated);

      alert("Menu updated successfully!");
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to update menu.");
    }

    setLoading(false);
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Update Mess Menu</h3>

        <form className="modal-form-body" onSubmit={handleSubmit}>
          {/* STEP 0 — Select Day */}
          {step === 0 && (
            <>
              <label>Select Day:</label>
              <select
                name="dayId"
                className="form-input"
                value={formData.dayId}
                onChange={handleFieldChange}
                required
              >
                <option value="">Choose a Day</option>
                {menu.map((day) => (
                  <option key={day.id} value={day.id}>
                    {day.dayName}
                  </option>
                ))}
              </select>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-next-modal"
                  onClick={() => {
                    if (!formData.dayId) {
                      alert("Please select a day first.");
                      return;
                    }
                    nextStep(); // go to meal selection
                  }}
                >
                  Next
                </button>

                <button type="button" className="btn-close-modal" onClick={onClose}>
                  Close
                </button>
              </div>
            </>
          )}

          {/* STEP 1 — Choose Meal to Edit */}
          {step === 1 && (
            <>
              <label>Select Meal to Update:</label>
              <select
                className="form-input"
                value={mealStep}
                onChange={(e) => setMealStep(Number(e.target.value))}
              >
                {stepNames.map((name, index) => (
                  <option key={index} value={index}>
                    {name}
                  </option>
                ))}
              </select>

              <label style={{ marginTop: "1rem" }}>{stepNames[mealStep]}:</label>
              <textarea
                name={stepKeys[mealStep]}
                className="form-input"
                placeholder={`Enter New ${stepNames[mealStep]}`}
                value={formData[stepKeys[mealStep]]}
                onChange={handleFieldChange}
              />

              <div className="modal-actions">
                <button type="button" className="btn-prev-modal" onClick={prevStep}>
                  Previous
                </button>

                <button type="submit" className="btn-primary">
                  Submit
                </button>

                <button type="button" className="btn-close-modal" onClick={onClose}>
                  Close
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
