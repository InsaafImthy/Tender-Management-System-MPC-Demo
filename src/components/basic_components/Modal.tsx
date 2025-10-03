import { CloseIcon } from "../../utils/Icons";
import { ModalProps } from "../../types/Types";

const Modal = ({
  isOpen,
  onClose,
  content,
  width = "3/4",
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
      className={`fixed inset-0 flex ${justifyClass} ${alignClass} z-20 bg-black bg-opacity-20 backdrop-blur-sm !m-0`}
    >
      <div
        className={`bg-white relative flex flex-col h-full ${width} shadow-2xl rounded-md overflow-hidden`}
      >
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 z-30 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
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
