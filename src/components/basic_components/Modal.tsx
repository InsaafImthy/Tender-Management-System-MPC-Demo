import { CloseIcon } from "../../utils/Icons";
import { ModalProps } from "../../types/Types";

const Modal = ({
  isOpen,
  onClose,
  content,
  width = "3/4",
  height = 'h-full',
  modalPosition = "center",
  contentPosition = "start",
}: ModalProps) => {
  if (!isOpen) return null;

  // Determine Tailwind classes for modal positioning
  const justifyClass =
    modalPosition === "start"
      ? "justify-start"
      : modalPosition === "end"
        ? "justify-end"
        : "justify-center";

  const alignClass =
    contentPosition === "start"
      ? "items-start"
      : contentPosition === "end"
        ? "items-end"
        : "items-center";

  return (
    <div
      className={`fixed inset-0 flex ${justifyClass} ${alignClass} z-20 bg-slate-950/35 backdrop-blur-sm !m-0`}
    >
      <div
        className={`bg-white relative flex flex-col ${height} ${width} shadow-[0_28px_90px_rgba(15,23,42,0.24)] border border-slate-200 rounded-xl overflow-hidden`}
      >
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 z-30 p-2 text-slate-400 hover:text-violet-800 hover:bg-violet-50 rounded-full transition-colors duration-200"
          onClick={onClose}
        >
          <CloseIcon className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        <div className="w-full h-full overflow-hidden">
          {content}
        </div>
      </div>
    </div>
  );
};

export default Modal;
