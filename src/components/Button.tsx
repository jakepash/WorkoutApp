import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
}

const variants = {
  primary:
    "bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 shadow-md shadow-emerald-200",
  ghost: "bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200"
};

const Button: React.FC<ButtonProps> = ({ children, variant = "primary", className = "", ...rest }) => {
  return (
    <button
      className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
