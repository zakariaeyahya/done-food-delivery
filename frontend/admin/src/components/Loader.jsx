// frontend/admin/src/components/Loader.jsx

import React from "react";

export default function Loader({ size = 8, message = "Chargement..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-gray-500">
      <div
        className={`animate-spin rounded-full h-${size} w-${size} border-b-2 border-gray-700`}
      ></div>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
}
