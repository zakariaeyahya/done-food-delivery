import React from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-red-600">
      <ExclamationTriangleIcon className="h-10 w-10 mb-2" />

      <p className="text-sm font-medium">
        {message || "Une erreur est survenue."}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 px-4 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
        >
          Réessayer
        </button>
      )}
    </div>
  );
}
