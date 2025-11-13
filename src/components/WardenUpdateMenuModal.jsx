// src/components/WardenUpdateMenuModal.jsx
// Replace the previous file with this. Implements multi-day editing
// with persistence of edits until final Submit (which sends all updates).

import React, { useState } from "react";
import { db } from "../services/firebase";
import { updateDoc, doc, serverTimestamp } from "firebase/firestore";

export default function WardenUpdateMenuModal({ menu = [], onClose }) {
  // mode: "select" => select a day to edit
  //       "form"   => editing a particular day's form (one of entries)
  const [mode, setMode] = useState("select");

  // entries: array of { dayId, dayName, original: {...}, form: {...} }
  // original holds the menu values pulled from `menu` prop when entry created
  // form holds the editable values (starts prefilled from original)
  const [entries, setEntries] = useState([]);

  // index of currently active entry in entries[]
  const [activeIndex, setActiveIndex] = useState(-1);

  // selectedDayId used on the select screen
  const [selectedDayId, setSelectedDayId] = useState("");

  const [loading, setLoading] = useState(false);

  // helper: find a menu object by id
  const findMenuById = (id) => menu.find((m) => m.id === id);

  // Create or reuse an entry for a given dayId; return its index
  const ensureEntryForDay = (dayId) => {
    const existingIndex = entries.findIndex((e) => e.dayId === dayId);
    if (existingIndex !== -1) return existingIndex;

    const day = findMenuById(dayId) || {};
    const original = {
      breakfast: day.breakfast ?? "",
      lunch: day.lunch ?? "",
      snacks: day.snacks ?? "",
      dinner: day.dinner ?? "",
    };
    const newEntry = {
      dayId,
      dayName: day.dayName ?? dayId,
      original,
      form: { ...original },
    };

    setEntries((prev) => [...prev, newEntry]);
    return entries.length; // new entry will be at this index (before setState completes)
  };

  // When user clicks Next on the select-day screen:
  // ensure an entry exists, switch to form for that entry.
  const handleSelectNext = () => {
    if (!selectedDayId) {
      alert("Please select a day first.");
      return;
    }

    // If entry exists, go to it; otherwise create and then go to it.
    const idx = entries.findIndex((e) => e.dayId === selectedDayId);
    if (idx !== -1) {
      setActiveIndex(idx);
      setMode("form");
      return;
    }

    // Create entry and then set it active.
    const day = findMenuById(selectedDayId) || {};
    const original = {
      breakfast: day.breakfast ?? "",
      lunch: day.lunch ?? "",
      snacks: day.snacks ?? "",
      dinner: day.dinner ?? "",
    };
    const newEntry = {
      dayId: selectedDayId,
      dayName: day.dayName ?? selectedDayId,
      original,
      form: { ...original },
    };

    setEntries((prev) => {
      const next = [...prev, newEntry];
      setActiveIndex(next.length - 1);
      setMode("form");
      return next;
    });
  };

  // Update a field in the active entry's form (persisted)
  const handleFormChange = (name, value) => {
    if (activeIndex < 0) return;
    setEntries((prev) => {
      const next = prev.map((e, i) =>
        i === activeIndex ? { ...e, form: { ...e.form, [name]: value } } : e
      );
      return next;
    });
  };

  // Previous action:
  // If we're in form and there is a previous entry, go to previous entry's form.
  // If we're in form and there is no previous entry, go back to select screen.
  // If we're in select screen and entries exist, go to last entry's form.
  const handlePrevious = () => {
    if (mode === "form") {
      if (activeIndex > 0) {
        setActiveIndex(activeIndex - 1);
        setMode("form");
      } else {
        // back to select-screen (first form -> select)
        setMode("select");
        setSelectedDayId(entries[activeIndex]?.dayId || "");
        setActiveIndex(-1);
      }
      return;
    }

    // mode === "select"
    if (entries.length > 0) {
      // go to the last entry's form
      setActiveIndex(entries.length - 1);
      setMode("form");
    } else {
      // nothing to go back to; stay on select
      setMode("select");
    }
  };

  // Next action from a form: we want to go to a NEW select screen (so user can pick another day)
  // but DO NOT discard current form data (it's already persisted in entries).
  const handleNext = () => {
    // Switch to select screen, but keep activeIndex as pointer to last edited entry
    setMode("select");
    setSelectedDayId("");
    setActiveIndex(-1);
  };

  // Submit: send updates for ALL entries that have differences between form and original.
  // After successful update, close modal.
  const handleSubmitAll = async () => {
    if (entries.length === 0) {
      alert("No edits to submit.");
      return;
    }

    setLoading(true);

    try {
      // For each entry, prepare only changed fields
      const updates = [];
      entries.forEach((e) => {
        const changed = {};
        ["breakfast", "lunch", "snacks", "dinner"].forEach((k) => {
          const newVal = (e.form[k] ?? "").trim();
          const origVal = (e.original[k] ?? "").trim();
          if (newVal !== "" && newVal !== origVal) {
            changed[k] = newVal;
          }
        });

        if (Object.keys(changed).length > 0) {
          changed.updatedAt = serverTimestamp();
          updates.push({ dayId: e.dayId, changed });
        }
      });

      if (updates.length === 0) {
        alert("No changes detected to submit.");
        setLoading(false);
        return;
      }

      // Run the updates (serially)
      for (const u of updates) {
        const docRef = doc(db, "messMenu", u.dayId);
        // eslint-disable-next-line no-await-in-loop
        await updateDoc(docRef, u.changed);
      }

      alert("All updates submitted successfully!");
      onClose();
    } catch (err) {
      console.error("Failed to submit updates:", err);
      alert("Failed to submit updates. See console.");
    } finally {
      setLoading(false);
    }
  };

  // Render helpers
  const renderSelectScreen = () => (
    <>
      <label>Select Day:</label>
      <select
        className="form-input"
        value={selectedDayId}
        onChange={(e) => setSelectedDayId(e.target.value)}
      >
        <option value="">Choose a Day</option>
        {menu.map((d) => (
          <option key={d.id} value={d.id}>
            {d.dayName}
          </option>
        ))}
      </select>

      <div className="modal-actions">
        <button className="btn-next-modal" onClick={handleSelectNext}>
          Next
        </button>

        {/* <button className="btn-prev-modal" onClick={handlePrevious}>
          Previous
        </button> */}

        <button className="btn-close-modal" onClick={onClose}>
          Close
        </button>
      </div>
    </>
  );

  const renderFormScreen = () => {
    const entry = entries[activeIndex];
    if (!entry) return null;

    return (
      <>
        <h4 style={{ marginTop: "10px" }}>
          Editing: {entry.dayName}
        </h4>

        <label>Breakfast:</label>
        <textarea
          name="breakfast"
          className="form-input"
          value={entry.form.breakfast}
          onChange={(e) => handleFormChange("breakfast", e.target.value)}
        />

        <label>Lunch:</label>
        <textarea
          name="lunch"
          className="form-input"
          value={entry.form.lunch}
          onChange={(e) => handleFormChange("lunch", e.target.value)}
        />

        <label>Snacks:</label>
        <textarea
          name="snacks"
          className="form-input"
          value={entry.form.snacks}
          onChange={(e) => handleFormChange("snacks", e.target.value)}
        />

        <label>Dinner:</label>
        <textarea
          name="dinner"
          className="form-input"
          value={entry.form.dinner}
          onChange={(e) => handleFormChange("dinner", e.target.value)}
        />

        <div className="modal-actions">
          <button className="btn-prev-modal" onClick={handlePrevious}>
            Previous
          </button>

          <button className="btn-next-modal" onClick={handleNext}>
            Next
          </button>

          <button
            className="btn-primary"
            onClick={handleSubmitAll}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>

          <button className="btn-close-modal" onClick={onClose}>
            Cancel
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="modal">
      <div className="modal-content" style={{ maxWidth: 700 }}>
        <h3>Update Mess Menu</h3>

        {/* Show a small breadcrumb/summary of edited days */}
        {entries.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <small>
              Edited days:{" "}
              {entries.map((e, i) => (
                <span key={e.dayId} style={{ marginRight: 8 }}>
                  {i === activeIndex ? <b>{e.dayName}</b> : e.dayName}
                </span>
              ))}
            </small>
          </div>
        )}

        {mode === "select" ? renderSelectScreen() : renderFormScreen()}
      </div>
    </div>
  );
}
