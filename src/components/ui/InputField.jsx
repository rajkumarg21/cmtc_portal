import React from "react";
import { sanitizeText } from "../../utils/security";

const InputField = ({
  label,
  id,
  type = "text",
  value,
  onChange,
  className = "",
  error,
  ...props
}) => {

  // sanitize value before showing
  const safeValue = sanitizeText(value);


  // sanitize value before sending to parent
  const handleChange = (e) => {

    const safeInput = sanitizeText(e.target.value);

    onChange({
      ...e,
      target: {
        ...e.target,
        value: safeInput,
      },
    });

  };


  return (
    <div className="mb-4">

      {label && (
        <label
          htmlFor={sanitizeText(id)}
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          {sanitizeText(label)}:
        </label>
      )}

      <input
        id={sanitizeText(id)}
        type={type}
        value={safeValue}
        onChange={handleChange}
        className={`shadow appearance-none border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 ${className}`}
        {...props}
      />

      {error && (
        <p className="text-red-500 text-xs italic mt-1">
          {sanitizeText(error)}
        </p>
      )}

    </div>
  );
};

export default InputField;