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
          className={`${
            "bg-white hover:bg-gradient-to-br hover:from-blue-400 hover:to-[#1365AA] hover:text-white"
          } rounded-2xl shadow-lg border-0 p-6 transition-all duration-300 relative overflow-hidden group`}
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium opacity-90">
                {status.label}
              </div>
              <div
                className={`w-8 h-8 rounded-full ${
                  status.color + " group-hover:bg-white/30"
                } flex items-center justify-center transition-all duration-300`}
              >
                <span
                  className={`text-sm ${
                    status.textColor + " group-hover:text-white"
                  }`}
                >
                  {status.icon}
                </span>
              </div>
            </div>

            <div className="mb-3">
              <div
                className={`text-4xl font-bold ${
                  "text-slate-900 group-hover:text-white"
                } transition-colors duration-300`}
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
