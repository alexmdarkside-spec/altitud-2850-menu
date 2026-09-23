"use client";

import React, { useState } from "react";

interface PairingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PairingDrawer({ isOpen, onClose }: PairingDrawerProps) {
  const [occasion, setOccasion] = useState("Cita");
  const [preference, setPreference] = useState("Salado");
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleConsult = async () => {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/pairing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ occasion, preference }),
      });

      if (!response.ok) throw new Error("Error en la consulta");

      const data = await response.json();
      setResult(data.recommendation || "No se pudo obtener una recomendación en este momento.");
    } catch (error) {
      setResult("Lo sentimos, el Sommelier IA no está disponible. Por favor, intenta más tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-500 ${
        isOpen ? "visible opacity-100" : "invisible opacity-0"
      }`}
    >
      {/* Overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500"
      />

      {/* Drawer Panel */}
      <div
        className={`absolute inset-y-0 right-0 w-full max-w-md transition-transform duration-500 ease-in-out transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="relative h-full w-full backdrop-blur-xl bg-[#080808]/80 border-l border-gold/30 shadow-2xl p-8 flex flex-col text-white">
          <div className="flex items-center justify-between mb-12">
            <h2 className="font-syne text-3xl font-bold text-gold">Maridaje IA</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 space-y-8">
            {/* Ocasión Selection */}
            <div className="space-y-3">
              <label className="block text-xs uppercase tracking-widest text-gold/70 font-semibold">
                Ocasión
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["Cita", "Negocios", "Celebración", "Familiar"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setOccasion(opt)}
                    className={`px-4 py-3 rounded-xl border transition-all duration-300 text-sm ${
                      occasion === opt
                        ? "bg-gold text-black border-gold shadow-[0_0_10px_rgba(197,160,89,0.3)]"
                        : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferencia de Sabor Selection */}
            <div className="space-y-3">
              <label className="block text-xs uppercase tracking-widest text-gold/70 font-semibold">
                Preferencia de Sabor
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["Dulce", "Salado", "Picante", "Fuerte"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setPreference(opt)}
                    className={`px-4 py-3 rounded-xl border transition-all duration-300 text-sm ${
                      preference === opt
                        ? "bg-gold text-black border-gold shadow-[0_0_10px_rgba(197,160,89,0.3)]"
                        : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleConsult}
              disabled={isLoading}
              className="w-full py-4 bg-gold text-black font-bold rounded-full transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gold/20"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.35 0 0 5.35 0 12h4z" />
                  </svg>
                  Consultando Sommelier...
                </span>
              ) : (
                "Consultar Sommelier IA"
              )}
            </button>

            {/* Result Area */}
            {result && (
              <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-gold/20 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                <p className="text-xs uppercase tracking-widest text-gold/70 font-semibold mb-2">
                  Recomendación del Sommelier
                </p>
                <p className="font-inter text-white/90 italic leading-relaxed">
                  "{result}"
                </p>
              </div>
            )}
          </div>

          <div className="mt-auto pt-8">
            <button
              onClick={onClose}
              className="w-full py-4 rounded-xl bg-white/5 border border-white/10 font-inter text-white/60 hover:bg-white/10 transition-all"
            >
              Cerrar Panel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
