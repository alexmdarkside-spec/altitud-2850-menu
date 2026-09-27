"use client";

import React, { useState, useEffect } from "react";

interface Dish {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  descripcion: string;
  ingredientes: string[];
  alergias: string[];
  maridaje: string;
  ocasion: string[];
  estilo: string[];
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
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {isHistoryOpen ? (
        /* VISTA DE HISTORIA / MODAL CON FOTO Y BARRA DE ACCIÓN */
        <div className="fixed inset-0 z-[9999] bg-[#080808] flex flex-col text-white h-[100dvh]">
          {/* CABECERA CON FOTO Y BOTÓN CERRAR */}
          <div className="relative w-full h-48 sm:h-56 shrink-0 overflow-hidden">
            <img
              src={dish.imagen}
              alt={dish.nombre}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-black/60" />
            <button
              type="button"
              onClick={() => setIsHistoryOpen(false)}
              className="absolute top-4 right-4 z-10 text-white bg-black/50 backdrop-blur-md rounded-full w-10 h-10 flex items-center justify-center border border-white/10"
            >
              ✕
            </button>
          </div>

          {/* CUERPO TEXTUAL DESPLAZABLE */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <span className="text-xs text-gold uppercase tracking-widest font-semibold">{dish.categoria}</span>
            <h2 className="text-2xl font-bold font-syne">{dish.nombre}</h2>

            <div className="p-4 bg-neutral-900/60 rounded-xl border border-gold/20 space-y-2">
              <p className="text-xs text-gold font-semibold uppercase tracking-wider">ORIGEN NEOTRADICIONAL</p>
              <p className="text-sm text-neutral-300 italic">{dish.descripcion}</p>
            </div>

            {/* INGREDIENTES Y MARIDAJE */}
            {dish.ingredientes && (
              <div className="space-y-2">
                <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">INGREDIENTES PRINCIPALES</p>
                <ul className="list-disc list-inside text-sm text-neutral-300 space-y-1">
                  {dish.ingredientes.map((ing, i) => (
                    <li key={i}>{ing}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">MARIDAJE SUGERIDO</p>
              <p className="text-sm text-neutral-300">{dish.maridaje}</p>
            </div>
          </div>

          {/* BARRA INFERIOR DE ACCIÓN */}
          <div className="p-4 bg-[#080808] border-t border-neutral-800 flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsHistoryOpen(false)}
              className="flex-1 py-3 bg-neutral-800 text-white font-semibold text-xs uppercase rounded-xl border border-neutral-700"
            >
              VOLVER AL PLATO
            </button>
            <div className="flex items-center bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-bold gap-3">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-6 h-6 flex items-center justify-center hover:text-gold"
              >
                -
              </button>
              <span className="min-w-[1rem] text-center">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-6 h-6 flex items-center justify-center hover:text-gold"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                onSelectDish(dish, quantity);
                setIsHistoryOpen(false);
              }}
              className="py-3 px-5 bg-gold text-black font-bold text-xs uppercase rounded-xl"
            >
              OK
            </button>
          </div>
        </div>
      ) : (
        /* VISTA NORMAL DEL PLATO */
        <div className="relative w-full h-[100dvh] flex flex-col bg-black overflow-y-auto select-none">

          {/* IMAGEN DE FONDO */}
          <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
            <img
              src={dish.imagen}
              alt={dish.nombre}
              className={`w-full h-full object-cover object-center transition-transform duration-500 ${
                isExpanded ? "scale-125" : "scale-100"
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
          </div>

          {/* CONTENIDO PRINCIPAL */}
          <div className="relative z-10 flex flex-col flex-grow p-6 pt-12 gap-y-6">

            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gold uppercase tracking-widest bg-black/60 px-3 py-1 rounded-full border border-gold/30">
                {dish.categoria}
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold font-syne text-white drop-shadow-lg">
                {dish.nombre}
              </h2>
              <p className="text-2xl font-bold text-gold font-syne">
                ${dish.precio} <span className="text-xs text-neutral-400 font-normal">USD</span>
              </p>
            </div>

            {isExpanded && (
              <div className="w-full bg-neutral-900/80 backdrop-blur-md p-5 rounded-2xl border border-gold/20 space-y-3">
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

            <div className="flex flex-col gap-3 mt-auto pb-8">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                style={{ touchAction: "manipulation" }}
                className="w-full py-3.5 bg-gold/20 active:bg-gold/40 border border-gold/60 text-gold text-xs font-bold uppercase tracking-widest rounded-xl cursor-pointer pointer-events-auto touch-manipulation"
              >
                {isExpanded ? "OCULTAR DETALLES" : "EXPLORAR PLATO"}
              </button>

              <div className="flex flex-row gap-x-2 items-center">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setIsHistoryOpen(true); }}
                  style={{ touchAction: "manipulation" }}
                  className="flex-1 py-3 bg-neutral-900 border border-neutral-700 text-gold text-xs font-medium rounded-xl cursor-pointer active:scale-95 pointer-events-auto touch-manipulation"
                >
                  Ver Historia
                </button>

                <div className="flex items-center bg-white rounded-full px-2 py-1 shadow-md relative z-[9999] pointer-events-auto">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setQuantity((q) => Math.max(1, q - 1)); }}
                    style={{ touchAction: "manipulation" }}
                    className="w-8 h-8 text-black font-bold text-base flex items-center justify-center cursor-pointer pointer-events-auto touch-manipulation"
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
                    className="w-8 h-8 text-black font-bold text-base flex items-center justify-center cursor-pointer pointer-events-auto touch-manipulation"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onSelectDish(dish, quantity); }}
                  style={{ touchAction: "manipulation" }}
                  className="py-3 px-5 bg-gold text-black font-bold text-xs uppercase tracking-wider rounded-full cursor-pointer active:scale-95 pointer-events-auto touch-manipulation"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
