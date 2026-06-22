import React from "react";

// Define the type for the data array passed to StatusBar
interface StatusBarProps {
  statuses: {
    icon: React.ReactNode;
    label: string;
    value: number;
    color: string;
    textColor: string;
  }[];
}

const StatusBar: React.FC<StatusBarProps> = ({ statuses }) => {
  return (
    <>
      {statuses.map((status, index) => (
        <div
          key={index}
          className="app-surface p-5 transition-all duration-300 relative overflow-hidden group hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_20px_45px_rgba(76,29,149,0.12)]"
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold text-slate-600">
                {status.label}
              </div>
              <div
                className="w-10 h-10 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-700 transition-all duration-300 group-hover:bg-violet-700 group-hover:text-white"
              >
                <span className="text-sm">
                  {status.icon}
                </span>
              </div>
            </div>

            <div className="mb-3">
              <div
                className="text-4xl font-bold text-slate-950 transition-colors duration-300"
              >
                {status.value}
              </div>
            </div>
          </div>
        </div>
      ))}
   
    </>
  );
};

export default StatusBar;
