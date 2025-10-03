import { useState, useEffect, useRef, JSX } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "../../utils/Icons";

interface Option {
  label: string | JSX.Element;
  value: string;
}

interface SelectFieldProps {
  id: string;
  search?: boolean;
  label?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  onClick?: () => void;
  style?: string;
  disabled?: boolean;
}

const SelectField = ({
  id,
  label,
  options,
  search = true,
  value,
  onChange,
  style = "h-[41px]",
  disabled = false,
}: SelectFieldProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: Option) => {
    if (!disabled) {
      onChange(option.value);
      setIsOpen(false);
      setSearchQuery(""); // Reset search when an option is selected
    }
  };

  const filteredOptions = options.filter((option) =>
    typeof option.label === "string"
      ? option.label.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div className={`relative ${style}`} ref={dropdownRef}>
      {label && (
        <label htmlFor={id} className={`block text-sm font-medium mb-1 ${disabled ? "text-gray-400" : ""}`}>
          {label}
        </label>
      )}

      {/* Trigger */}
      <div
        className={`w-full p-1.5 px-3 border text-sm rounded cursor-pointer flex items-center justify-between ${
          disabled ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" : "border-gray-300"
        }`}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen ? "true" : "false"}
        aria-disabled={disabled ? "true" : "false"}
      >
        <span>{value || "Select an option"}</span>
        <span className="ml-2">{isOpen ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}</span>
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute w-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-40 max-h-48 overflow-y-auto">
          {/* Search Input (Fixed at the top) */}
          {search && (
            <div className="sticky top-0 bg-white z-50 border-b border-gray-200 p-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none"
                placeholder="Search..."
              />
            </div>
          )}

          {/* Filtered Options */}
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={index}
                className={`px-3 py-2 hover:bg-gray-100 text-sm cursor-pointer ${
                  option.value === value ? "bg-gray-200" : ""
                }`}
                role="option"
                aria-selected={option.value === value ? "true" : "false"}
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">No options found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SelectField;
