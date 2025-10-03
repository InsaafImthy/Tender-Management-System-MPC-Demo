import { useState } from "react";
import { ITextFieldProp } from "../../types/Types";
import { EyeIcon, EyeSlashIcon } from "../../utils/Icons"; // Add CalendarIcon

const TextField = ({
  id,
  value = "", // Default value is an empty string
  setValue,
  onFocus,
  placeholder = "",
  field,
  title,
  type = "text",
  eye = false,
  style = "h-[41px]",
  width = "w-full",
  disabled = false,
  disablePrevDates = false,
  onKeyDown,
  maxLength,
  step = true,
  required = false
}: ITextFieldProp) => {
  const [show, setShow] = useState<boolean>(type !== "password");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!disabled && setValue) {
      const inputValue = e.target.value;
      setValue(inputValue); // Directly pass the updated value
    }
  };

  const handleNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["e", "E", "+", "-"].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>, handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void) => {
    let val = e.target.value;

    // Allow only numbers and a single decimal point
    val = val.replace(/[^0-9.]/g, "");

    // Restrict to two decimal places
    if (val.includes(".")) {
      const parts = val.split(".");
      if (parts[1]?.length > 2) {
        val = `${parts[0]}.${parts[1].substring(0, 2)}`;
      }
    }

    // Create a new event with the updated value
    const event = { ...e, target: { ...e.target, value: val } };
    handleChange(event as React.ChangeEvent<HTMLInputElement>); // Ensure type safety
  };


  const handleFocus = () => {
    if (!disabled && onFocus) {
      onFocus();
    }
  };

  return (
    <div
      className={`flex flex-col p-2 rounded border relative ${style} ${type === "number" ? style : ""}  ${type === "password" ? style : ""} ${disabled ? "bg-gray-100 border-gray-200 cursor-not-allowed" : "border-gray-300"
        }`}
    >
      {/* Optional Title */}
      {title && <span className="text-xs text-gray-500 mb-1">{title}</span>}

      {/* Conditionally render input or textarea */}
      {type === "textarea" ? (
        <textarea
          required={required}
          id={id || field} // Fallback to field name as id
          onFocus={handleFocus}
          value={value} // Bind value
          placeholder={placeholder}
          onChange={handleChange}
          onKeyDown={onKeyDown || undefined}
          disabled={disabled} // Handle disabled state
          className={`border-none outline-none ${width} text-sm ${disabled ? "text-gray-400" : ""
            }`}
          aria-label={title || placeholder}
        />
      ) : type === "date" ? (
        <div className="relative">
          <input
            required={required}
            onFocus={handleFocus}
            id={id || field} // Fallback to field name as id
            value={value} // Bind value
            type="date"
            placeholder={placeholder}
            onChange={handleChange}
            onKeyDown={onKeyDown || undefined}
            disabled={disabled} // Handle disabled state
            min={disablePrevDates ? new Date().toISOString().split("T")[0] : undefined}
            className={`border-none outline-none h-full ${width} text-sm ${disabled ? "text-gray-400" : ""
              }`}
            aria-label={title || placeholder}
          />
        </div>
      ) : (
        // <input
        //   maxLength={maxLength}
        //   onFocus={handleFocus}
        //   id={id || field} // Fallback to field name as id
        //   value={value} // Bind value
        //   type={show || type !== "password" ? (type === "number" ? "number" : "text") : "password"}
        //   placeholder={placeholder}
        //   onChange={handleChange}
        //   onKeyDown={onKeyDown || undefined}
        //   disabled={disabled} // Handle disabled state
        //   className={`border-none outline-none h-full ${width} text-sm ${disabled ? "text-gray-400" : ""} ${type === "number" ? "hide-arrows" : ""}`}
        //   aria-label={title || placeholder}
        // />
        <input
          required={required}
          maxLength={maxLength}
          onFocus={handleFocus}
          onKeyDown={type === "number" ? (e) => handleNumberKeyDown(e) : undefined}
          id={id || field} // Fallback to field name as id
          value={value}
          type={show || type !== "password" ? (type === "number" ? "number" : "text") : "password"}
          placeholder={placeholder}
          onChange={(e) => (type === "number" ? handleNumberInput(e, handleChange) : handleChange(e))}
          // onKeyDown={onKeyDown || undefined}
          disabled={disabled}
          className={`border-none outline-none h-full ${width} text-sm ${disabled ? "text-gray-400" : ""} ${type === "number" ? "hide-arrows" : ""}`}
          aria-label={title || placeholder}
          step={step ? "0.01" : undefined}
        />

      )}

      {/* Eye Icon for Password Inputs */}
      {type === "password" && eye && !disabled && (
        <span
          className="absolute right-2 bottom-2 cursor-pointer"
          onClick={() => setShow(!show)}
        >
          {show ? <EyeSlashIcon className="w-4 h-4 text-gray-500" /> : <EyeIcon className="w-4 h-4 text-gray-500" />}
        </span>
      )}
    </div>
  );
};

export default TextField;