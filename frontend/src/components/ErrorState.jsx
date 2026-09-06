export default function ErrorState({ message = "Something went wrong.", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-red-600 font-medium">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 text-sm rounded-md bg-[#16233A] text-white hover:bg-[#1E3352]"
        >
          Retry
        </button>
      )}
    </div>
  );
}