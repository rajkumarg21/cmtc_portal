import React from "react";
import PropTypes from "prop-types";

const Button = ({
  children,
  onClick,
  type = "button",
  className = "",
  variant = "primary",
  ...rest
}) => {

  const baseStyles =
    "px-4 py-2 rounded-full font-semibold transition-all duration-200 ease-in-out transform hover:scale-105 shadow-md";

  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",

    secondary:
      "bg-gray-300 text-gray-800 hover:bg-gray-400 focus:ring-gray-500",

    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",

    outline:
      "bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500",
  };


  // ✅ Secure click handler validation
  const handleClick = (e) => {

    if (typeof onClick === "function") {

      onClick(e);

    } else if (onClick !== undefined) {

      console.warn("Blocked unsafe onClick");

    }

  };


  return (

    <button

      type={type}

      onClick={handleClick}

      className={`${baseStyles} ${variants[variant] || variants.primary} ${className}
      focus:outline-none focus:ring-2 focus:ring-opacity-50`}

      {...rest}

    >

      {children}

    </button>

  );

};


Button.propTypes = {

  children: PropTypes.node,

  onClick: PropTypes.func,

  type: PropTypes.oneOf(["button", "submit", "reset"]),

  className: PropTypes.string,

  variant: PropTypes.oneOf([
    "primary",
    "secondary",
    "danger",
    "outline",
  ]),

};


export default Button;
