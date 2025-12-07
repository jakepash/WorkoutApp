import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = "", ...rest }) => {
  return (
    <div
      className={`rounded-2xl bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Card;
