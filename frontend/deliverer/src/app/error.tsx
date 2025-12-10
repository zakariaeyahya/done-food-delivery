"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md text-center">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            Oups ! Une erreur est survenue
          </h1>
          <p className="text-slate-400">
            {error.message || "Une erreur inattendue s'est produite"}
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Button variant="primary" onClick={reset}>
            Réessayer
          </Button>
          <Button variant="secondary" onClick={() => window.location.href = "/"}>
            Retour à l'accueil
          </Button>
        </div>
      </Card>
    </div>
  );
}

