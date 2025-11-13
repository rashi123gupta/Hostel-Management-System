import React, { useState } from "react";
// --- MODIFICATION: Remove direct Firebase imports ---
// import { addDoc, collection, serverTimestamp } from "firebase/firestore";
// import { db } from "../services/firebase";
// --- MODIFICATION: Import the new service function ---
import { addMessSuggestion } from "../services/messMenuService";
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
  // --- MODIFICATION: Added loading and error state ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- MODIFICATION: handleSubmit is now async and uses the service ---
  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      // The service function now handles all the logic
      await addMessSuggestion(formData, userProfile);
      
      alert("Suggestion submitted successfully!");
      onClose();
    } catch (err) {
      console.error("Error submitting suggestion:", err);
      setError(err.message || "Failed to submit suggestion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Add Mess Menu Suggestion</h3>
        {/* --- MODIFICATION: Show error message --- */}
        {error && <p className="error-message">{error}</p>}

        <div className="modal-form-body">
          {step === 1 && (
            <>
              {/* --- MODIFICATION: Use proper label 'for' and 'id' --- */}
              <label htmlFor="breakfast">Breakfast Suggestion</label>
              <textarea
                className="form-input"
                id="breakfast"
                name="breakfast"
                value={formData.breakfast}
                onChange={handleChange}
                placeholder="Enter breakfast suggestion"
              />
            </>
          )}

          {step === 2 && (
            <>
              <label htmlFor="lunch">Lunch Suggestion</label>
              <textarea
                className="form-input"
                id="lunch"
                name="lunch"
                value={formData.lunch}
                onChange={handleChange}
                placeholder="Enter lunch suggestion"
              />
            </>
          )}

          {step === 3 && (
            <>
              <label htmlFor="snacks">Snacks Suggestion</label>
              <textarea
                className="form-input"
                id="snacks"
                name="snacks"
                value={formData.snacks}
                onChange={handleChange}
                placeholder="Enter snacks suggestion"
              />
            </>
          )}

          {step === 4 && (
            <>
              <label htmlFor="dinner">Dinner Suggestion</label>
              <textarea
                className="form-input"
                id="dinner"
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
              disabled={loading}
            >
              Previous
            </button>
          )}
          {step < 4 && (
            <button
              className="btn-next-modal"
              onClick={() => setStep(step + 1)}
              disabled={loading}
            >
              Next
            </button>
          )}
          {step === 4 && (
            // --- MODIFICATION: Added loading state ---
            <button 
              className="btn-primary" 
              onClick={handleSubmit} 
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          )}
          <button 
            className="btn-close-modal" 
            onClick={onClose} 
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}