interface ContinueBtn {
  onClick: () => void;
  text: string;
  path_1: string;
  path_2: string;
  color: string;
  disabled?: boolean;
  loading?: boolean;
}

const colorClasses: Record<string, string> = {
  indigo: "bg-indigo-500 hover:bg-indigo-600 text-white",
  blue: "bg-blue-500 hover:bg-blue-600 text-white",
  green: "bg-green-500 hover:bg-green-600 text-white",
  zinc: "bg-zinc-100 hover:bg-zinc-300 text-black",
  yellow: "bg-yellow-300 hover:bg-yellow-400 text-black",
};

const disabledClasses = "opacity-40 cursor-not-allowed hover:opacity-40";

const ContinueBtn = ({ onClick, text, path_1, path_2, color, disabled = false, loading = false }: ContinueBtn) => {
  const isDisabled = disabled || loading;

  return (
    <button
      onClick={isDisabled ? undefined : onClick}
      aria-label={text}
      disabled={isDisabled}
      className={`px-4 py-2 transition-all text-sm rounded-md shadow-sm ${colorClasses[color]} flex items-center justify-center min-h-[36px] ${isDisabled ? disabledClasses : "cursor-pointer"}`}
    >
      {loading ? (
        <svg
          className="w-4 h-4 mr-1 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={path_1}
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={path_2}
          />
        </svg>
      )}
      {loading ? "Loading..." : text}
    </button>
  );
};

export default ContinueBtn;
