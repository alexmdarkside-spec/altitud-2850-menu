"use client";

import React, { useState } from "react";

interface PairingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSequenceSelected?: (data: {
    secuenciaIds: string[];
    maridajeSugerido: string;
    notaCataSommelier: string;
  }) => void;
}

export default function PairingDrawer({ isOpen, onClose, onSequenceSelected }: PairingDrawerProps) {
  const [occasion, setOccasion] = useState("Cita Romántica");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleAllergy = (allergy: string) => {
    setAllergies((prev) =>
      prev.includes(allergy)
        ? prev.filter((a) => a !== allergy)
        : [...prev, allergy]
    );
  };

  const handleConsult = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/pairing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ocasion: occasion || 'Cita Romántica',
          alergias: allergies || []
        }),
      });

      if (!response.ok) {
        const errData = await response.text();
        console.error('Error detallado del backend (400/500):', errData);
        throw new Error(errData);
      }

      const data = await response.json();
      onSequenceSelected?.(data);
      onClose();
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Lo sentimos, el Sommelier IA no está disponible.'}`);
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
      {/* Full Screen Modal */}
      <div
        className={`fixed inset-0 z-50 bg-[#080808]/95 backdrop-blur-md overflow-y-auto transition-all duration-500 ${
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"
        }`}
      >
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-8 text-white">
          <button
            onClick={onClose}
            className="absolute top-8 right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="w-full max-w-2xl space-y-12 text-center">
            <div className="space-y-4">
              <h2 className="font-syne text-5xl font-bold text-gold">Maridaje IA</h2>
              <p className="text-white/60 font-inter text-lg">Diseñemos una experiencia gastronómica a tu medida</p>
            </div>

            <div className="space-y-8 text-left bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-sm">
              {/* Ocasión Selection */}
              <div className="space-y-4">
                <label className="block text-xs uppercase tracking-widest text-gold/70 font-semibold">
                  Ocasión
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {["Cita Romántica", "Reunión de Negocios", "Celebración Especial", "Experiencia Local"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setOccasion(opt)}
                      className={`px-4 py-4 rounded-2xl border transition-all duration-300 text-sm font-medium ${
                        occasion === opt
                          ? "bg-gold text-black border-gold shadow-[0_0_15px_rgba(197,160,89,0.3)]"
                          : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alergias Selection */}
              <div className="space-y-4">
                <label className="block text-xs uppercase tracking-widest text-gold/70 font-semibold">
                  Filtro de Alergias
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Lácteos", "Pescado/Mariscos", "Gluten", "Cerdo", "Huevo"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => toggleAllergy(opt)}
                      className={`px-4 py-2 rounded-full border transition-all duration-300 text-sm ${
                        allergies.includes(opt)
                          ? "bg-gold/20 border-gold text-gold"
                          : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleConsult}
              disabled={isLoading}
              className="w-full py-5 bg-gold text-black font-bold text-xl rounded-full transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-gold/20"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-6 w-6 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.35 0 0 5.35 0 12h4z" />
                  </svg>
                  Diseñando tu experiencia...
                </span>
              ) : (
                "Diseñar Menú en 3 Tiempos ✨"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
