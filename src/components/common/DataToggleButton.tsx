import React from "react";

type DataToggleButtonProps = {
  onClick: () => void;
  isActive: boolean;
};

export const DataToggleButton: React.FC<DataToggleButtonProps> = ({
  onClick,
  isActive,
}) => {
  return (
    <button
      onClick={onClick}
      aria-label={isActive ? "Show sidebar menu sections" : "Hide sidebar menu sections"}
      className={`relative flex items-center justify-center h-11 w-11 rounded-full border transition-colors ${
        isActive
          ? "text-gray-500 bg-white border-gray-200 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          : "text-gray-400 border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-gray-700"
      }`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2 4C2 3.44772 2.44772 3 3 3H4C4.55228 3 5 3.44772 5 4V16C5 16.5523 4.55228 17 4 17H3C2.44772 17 2 16.5523 2 16V4ZM7 8C7 7.44772 7.44772 7 8 7H9C9.55228 7 10 7.44772 10 8V16C10 16.5523 9.55228 17 9 17H8C7.44772 17 7 16.5523 7 16V8ZM12 11C12 10.4477 12.4477 10 13 10H14C14.5523 10 15 10.4477 15 11V16C15 16.5523 14.5523 17 14 17H13C12.4477 17 12 16.5523 12 16V11ZM17 6C17 5.44772 17.4477 5 18 5H19C19.5523 5 20 5.44772 20 6V16C20 16.5523 19.5523 17 19 17H18C17.4477 17 17 16.5523 17 16V6Z"
          fill="currentColor"
        />
      </svg>
    </button>
  );
};
