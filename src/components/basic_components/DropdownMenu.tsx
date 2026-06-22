import React, { useEffect, useRef } from "react";

interface IDot {
  setEditOption?: (data: any) => void;
  setBlockOption?: (data: any) => void;
  setDeleteOption?: (data: any) => void;
  onView?: (data: any) => void;
}

const DropdownMenu: React.FC<
  {
    position: { top: number; left: number };
    data: any;
    setOpenDropdown: (index: number | null) => void;
  } & IDot
> = ({
  position,
  data,
  setOpenDropdown,
  setEditOption,
  setBlockOption,
  setDeleteOption,
   onView,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="absolute w-40 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-[0_18px_44px_rgba(15,23,42,0.18)] backdrop-blur"
      style={{ top: position.top, left: position.left, zIndex: 100 }}
    >
      {setEditOption && (
        <button
          className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-violet-50 hover:text-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-200"
          onClick={() => setEditOption(data)}
        >
          Edit
        </button>
      )}
      {onView && (
        <button
          className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-violet-50 hover:text-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-200"
          onClick={() => onView(data)}
        >
          View
        </button>
      )}
      {setBlockOption && (
        <button
          className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-violet-50 hover:text-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-200"
          onClick={() => setBlockOption(data)}
        >
          {data.isActive ? "Block" : "Unblock"}
        </button>
      )}
      {setDeleteOption && (
        <button
          className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-200"
          onClick={() => setDeleteOption(data)}
        >
          Delete
        </button>
      )}
    </div>
  );
};

export default DropdownMenu;
