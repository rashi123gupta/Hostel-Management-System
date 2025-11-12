import React from 'react';

function FormInput({ type, name, placeholder, value, onChange }) {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="form-input"
    />
  );
}

export default FormInput;
