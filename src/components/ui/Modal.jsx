import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { sanitizeText } from "../../utils/security";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className = "",
}) => {

  if (!isOpen) return null;


  // ✅ Safe handler validation
  const handleClose = (e) => {

    if (typeof onClose === "function") {

      onClose(e);

    } else {

      console.warn("Blocked unsafe onClose handler");

    }

  };


  // ✅ sanitize title
  const safeTitle = sanitizeText(title);


  return ReactDOM.createPortal(

    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">

      <div
        className={`bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative ${className}`}
      >

        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold"
          aria-label="Close modal"
        >
          &times;
        </button>


        {/* ✅ SAFE TITLE */}
        {safeTitle && (

          <h2 className="text-2xl font-bold mb-4 text-gray-800">

            {safeTitle}

          </h2>

        )}


        {/* ✅ SAFE CHILDREN */}

        <div>

          {typeof children === "string"

            ? sanitizeText(children)

            : children}

        </div>

      </div>

    </div>,

    document.body

  );

};

Modal.propTypes = {

  isOpen: PropTypes.bool.isRequired,

  onClose: PropTypes.func.isRequired,

  title: PropTypes.string,

  children: PropTypes.node,

  className: PropTypes.string,

};

export default Modal;