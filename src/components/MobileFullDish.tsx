"use client";

import React, { useState, useEffect } from "react";

interface Dish {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  descripcion: string;
  ingredientes: string[];
  imagen: string;
}

interface MobileFullDishProps {
  dish: Dish;
  numComensales?: number;
  onSelectDish: (dish: Dish, quantity: number) => void;
  onOpenHistory: (dish: Dish) => void;
}

export default function MobileFullDish({
  dish,
  numComensales = 1,
  onSelectDish,
  onOpenHistory,
}: MobileFullDishProps) {
  const [mounted, setMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Previene que el servidor envíe HTML estático sin listeners activos

  return (
    <div className="relative w-full h-[100dvh] bg-[#080808] text-white flex flex-col justify-between p-6 overflow-hidden select-none">

      {/* CAPA DE FONDO E IMAGEN (INCAPAZ DE BLOQUEAR CLICS) */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <img
          src={dish.imagen}
          alt={dish.nombre}
          className={`w-full h-full object-cover object-center transition-transform duration-500 ${
            isExpanded ? "scale-125" : "scale-100"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#080808]/60 via-transparent to-transparent" />
      </div>

      {/* ENCABEZADO */}
      <div className="relative z-10 pt-2 flex justify-between items-center pointer-events-none">
        <span className="text-[10px] text-gold uppercase tracking-widest bg-black/60 px-3 py-1 rounded-full border border-gold/30">
          {dish.categoria}
        </span>
      </div>

      {/* CAPA INTERACTIVA (Z-INDEX 9999 Y POINTER-EVENTS-AUTO REAL) */}
      <div className="relative z-[9999] pointer-events-auto mb-4 w-full">
        <h2 className="text-3xl font-bold font-syne text-white mb-1 drop-shadow-lg">
          {dish.nombre}
        </h2>

        <p className="text-2xl font-bold text-gold font-syne mb-3">
          ${dish.precio} <span className="text-xs text-neutral-400 font-normal">USD</span>
        </p>

        {isExpanded && (
          <div className="mb-4 bg-black/85 backdrop-blur-md p-4 rounded-2xl border border-gold/20 space-y-2 max-h-[30vh] overflow-y-auto">
            <p className="text-xs text-neutral-200 leading-relaxed font-light">
              {dish.descripcion}
            </p>
            {dish.ingredientes && (
              <div className="flex flex-wrap gap-1 pt-1">
                {dish.ingredientes.map((ing, i) => (
                  <span key={i} className="text-[9px] bg-neutral-800 text-gold px-2 py-0.5 rounded-md">
                    {ing}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          {/* BOTÓN EXPLORAR PLATO */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            style={{ touchAction: "manipulation" }}
            className="w-full py-3.5 bg-gold/20 active:bg-gold/40 border border-gold/60 text-gold text-xs font-bold uppercase tracking-widest rounded-xl cursor-pointer pointer-events-auto touch-manipulation z-[9999]"
          >
            {isExpanded ? "OCULTAR DETALLES" : "EXPLORAR PLATO"}
          </button>

          <div className="flex items-center gap-2">
            {/* HISTORIA */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onOpenHistory(dish); }}
              style={{ touchAction: "manipulation" }}
              className="flex-1 py-3 bg-neutral-900 border border-neutral-700 text-gold text-xs font-medium rounded-xl cursor-pointer active:scale-95 pointer-events-auto touch-manipulation z-[9999]"
            >
              Ver Historia
            </button>

            {/* CONTADOR */}
            <div className="flex items-center bg-white rounded-full px-2 py-1 shadow-md relative z-[9999] pointer-events-auto">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setQuantity((q) => Math.max(1, q - 1)); }}
                style={{ touchAction: "manipulation" }}
                className="w-8 h-8 text-black font-bold text-base flex items-center justify-center cursor-pointer pointer-events-auto touch-manipulation z-[9999]"
              >
                -
              </button>
              <span className="text-xs font-bold text-black px-2 min-w-[16px] text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setQuantity((q) => q + 1); }}
                style={{ touchAction: "manipulation" }}
                className="w-8 h-8 text-black font-bold text-base flex items-center justify-center cursor-pointer pointer-events-auto touch-manipulation z-[9999]"
              >
                +
              </button>
            </div>

            {/* SELECCIONAR / OK */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onSelectDish(dish, quantity); }}
              style={{ touchAction: "manipulation" }}
              className="py-3 px-5 bg-gold text-black font-bold text-xs uppercase tracking-wider rounded-full cursor-pointer active:scale-95 pointer-events-auto touch-manipulation z-[9999]"
            >
              OK
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
