import React, { useRef, useState, useEffect } from "react";
import { Check, ChevronLeft, ChevronRight, XIcon } from "lucide-react";
import "./StepIndicator.css";
import { IStep } from "../../../../types/approvalflowTypes";


// ✅ Corrected Props Typing
const StepIndicator: React.FC<{ steps: IStep[] }> = ({ steps }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateScrollButtons = () => {
        if (scrollContainerRef.current) {
            setCanScrollLeft(scrollContainerRef.current.scrollLeft > 0);
            setCanScrollRight(
                scrollContainerRef.current.scrollLeft <
                scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth - 1
            );
        }
    };

    const handleScroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const scrollAmount = 200;
            const newScrollLeft =
                scrollContainerRef.current.scrollLeft +
                (direction === "left" ? -scrollAmount : scrollAmount);
            scrollContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: "smooth",
            });
        }
    };

    useEffect(() => {
        updateScrollButtons();
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener("scroll", updateScrollButtons);
            return () => container.removeEventListener("scroll", updateScrollButtons);
        }
    }, []);

    return (
        <div className="bg-gray-50 rounded p-3 mb-3 border border-gray-200 mt-4">
            {/* Header */}
            <div className="flex items-center space-x-2 mb-3">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900">Approval Flow</h3>
                    <p className="text-sm text-gray-600">Track progress</p>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="relative flex items-center">
                {canScrollLeft && (
                    <button
                        onClick={() => handleScroll("left")}
                        className="absolute z-10 left-0 p-1 rounded-full bg-white shadow-sm hover:bg-gray-50 transition-all duration-200"
                    >
                        <ChevronLeft className="w-3 h-3 text-blue-500" />
                    </button>
                )}

                <div
                    ref={scrollContainerRef}
                    className="overflow-x-auto py-1 px-4 flex-1 scroll-smooth no-scrollbar"
                >
                    <div className="relative flex items-center min-w-max">
                        {steps.map((step, index) => (
                            <div key={index} className="relative flex items-center">
                                {/* Step Circle */}
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-300 ${
                                            step.status === "approved" 
                                                ? "bg-green-500 border-white" 
                                                : step.status === "rejected" 
                                                    ? "bg-red-500 border-white"
                                                    : (step.status === "pending" && (index === 0 || steps[index - 1].status === "approved"))
                                                        ? "bg-blue-500 border-white"
                                                        : "bg-white border-gray-300"
                                        }`}
                                    >
                                        {step.status === "rejected" ? (
                                            <XIcon className="w-2 h-2 text-white" />
                                        ) : step.status === "approved" ? (
                                            <Check className="w-2 h-2 text-white" />
                                        ) : (
                                            <span className="text-xs font-bold text-white">
                                                {index + 1}
                                            </span>
                                        )}
                                    </div>

                                    {/* Step Label */}
                                    <div className="mt-1 text-center">
                                        <div className={`text-sm font-medium px-2 py-1 rounded ${
                                            step.status === "approved" 
                                                ? "bg-green-100 text-green-800" 
                                                : step.status === "rejected" 
                                                    ? "bg-red-100 text-red-800"
                                                    : (step.status === "pending" && (index === 0 || steps[index - 1].status === "approved"))
                                                        ? "bg-blue-100 text-blue-800"
                                                        : "bg-gray-100 text-gray-600"
                                        }`}>
                                            {step.approverRole}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {step.status === "approved" ? "Done" : 
                                             step.status === "rejected" ? "Rejected" : 
                                             (step.status === "pending" && (index === 0 || steps[index - 1].status === "approved")) ? "Active" : "Pending"}
                                        </div>
                                    </div>
                                </div>

                                {/* Connector Line */}
                                {index < steps.length - 1 && (
                                    <div className="flex items-center mx-1.5">
                                        <div className={`w-6 h-0.5 rounded-full transition-all duration-300 ${
                                            step.status === "approved" 
                                                ? "bg-green-500" 
                                                : "bg-gray-200"
                                        }`} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {canScrollRight && (
                    <button
                        onClick={() => handleScroll("right")}
                        className="absolute right-0 z-10 p-1 rounded-full bg-white shadow-sm hover:bg-gray-50 transition-all duration-200"
                    >
                        <ChevronRight className="w-3 h-3 text-blue-500" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default StepIndicator;
