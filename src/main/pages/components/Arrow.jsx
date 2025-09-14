import React from "react";

const Arrow = ({ left, onClick, disabled }) => {
  return (
    <svg
      onClick={onClick}
      className={`arrow ${left ? "arrow--left" : "arrow--right"}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      style={{
        cursor: disabled ? "default" : "pointer",
        width: 40,
        height: 40,
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        [left ? "left" : "right"]: 10,
        fill: disabled ? "#ccc" : "rgba(0,0,0,0.6)",
        zIndex: 10,
        userSelect: "none",
        borderRadius: "50%",
        backgroundColor: "rgba(255,255,255,0.7)",
        boxShadow: "0 0 5px rgba(0,0,0,0.3)",
      }}
    >
      {left ? (
        <path d="M16.67 0l2.83 2.829-9.339 9.175 9.339 9.167-2.83 2.829-12.17-11.996z" />
      ) : (
        <path d="M5 3l3.057-3 11.943 12-11.943 12-3.057-3 9-9z" />
      )}
    </svg>
  );
};

export default Arrow;