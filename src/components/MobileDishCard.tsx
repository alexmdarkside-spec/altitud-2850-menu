"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Dish {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  descripcion: string;
  ingredientes: string[];
  estilo?: string[];
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <section className="relative w-full h-[100dvh] bg-[#080808] overflow-hidden flex flex-col justify-between p-6 snap-start">
      
      {/* 1. IMAGEN DEL PLATO EN PANTALLA COMPLETA (FLOTANTE A LA DERECHA) */}
      <motion.div
        className="absolute -right-16 top-12 w-[85vw] h-[85vw] max-w-[380px] max-h-[380px] z-0 pointer-events-none"
        animate={{
          scale: isExpanded ? 1.15 : 1,
          x: isExpanded ? 30 : 0,
          rotate: isExpanded ? 5 : 0,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      >
        <img
          src={dish.imagen}
          alt={dish.nombre}
          className="w-full h-full object-cover rounded-full shadow-[0_0_60px_rgba(0,0,0,0.95)] border border-gold/10"
        />
      </motion.div>

      {/* DEGRADADO LATERAL QUE MANTIENE LA LEGIBILIDAD DEL TEXTO */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/85 to-transparent z-10 pointer-events-none" />

      {/* 2. ENCABEZADO SUPERIOR DISCRETO */}
      <div className="relative z-20 pt-4 flex items-center justify-between">
        <span className="text-[10px] text-gold font-syne uppercase tracking-[0.3em] bg-gold/10 px-3 py-1 rounded-full border border-gold/20">
          {dish.categoria}
        </span>
        <span className="text-xs text-neutral-400 font-mono">
          Altitud 2850m
        </span>
      </div>

      {/* 3. CONTENIDO PRINCIPAL Y DETALLES DEL PLATO */}
      <div className="relative z-20 mb-8 max-w-[85%]">
        
        {/* TÍTULO Y PRECIO */}
        <h2 className="text-3xl font-bold text-white font-syne leading-tight mb-2 drop-shadow-md">
          {dish.nombre}
        </h2>
        
        <p className="text-2xl font-bold text-gold font-syne mb-4">
          ${dish.precio} <span className="text-xs text-neutral-400 font-normal">USD</span>
        </p>

        {/* DETALLES DESPLEGABLES CON ANIMACIÓN */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: 10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: 10 }}
              transition={{ duration: 0.35 }}
              className="space-y-3 mb-4 overflow-hidden"
            >
              <p className="text-xs text-neutral-300 leading-relaxed font-light">
                {dish.descripcion}
              </p>

              {/* INGREDIENTES */}
              {dish.ingredientes && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {dish.ingredientes.map((ing, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] text-neutral-300 bg-neutral-900/90 border border-neutral-800 px-2 py-0.5 rounded-md"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4. BOTONES DE ACCIÓN MÓVIL (COMPATIBLES CON TOUCH REAL) */}
        <div className="flex flex-col gap-2.5 pt-2">
          
          {/* BOTÓN EXPLORAR (ZOOM / DESPLIEGUE) */}
          <button
            type="button"
            onClick={toggleExpand}
            onTouchEnd={(e) => {
              e.preventDefault();
              toggleExpand();
            }}
            className="w-full py-3 bg-gold/20 hover:bg-gold/30 active:scale-95 border border-gold/40 text-gold text-xs font-bold uppercase tracking-widest rounded-xl transition-all touch-manipulation cursor-pointer z-30"
          >
            {isExpanded ? "Ocultar Detalles" : "Explorar Plato"}
          </button>

          {/* ACCIONES DE HISTORIA Y SELECCIÓN MULTI-COMENSAL */}
          <div className="flex items-center gap-2">
            
            {/* BOTÓN VIRGEN DEL PANECILLO (HISTORIA) */}
            <button
              type="button"
              onClick={() => onOpenHistory(dish)}
              onTouchEnd={(e) => {
                e.preventDefault();
                onOpenHistory(dish);
              }}
              className="flex-1 py-3 bg-neutral-900/90 border border-neutral-800 text-neutral-300 text-[11px] font-medium rounded-xl active:scale-95 transition-all touch-manipulation cursor-pointer z-30"
            >
              Ver Historia
            </button>

            {/* CONTADOR SI HAY MÁS DE 1 COMENSAL */}
            {numComensales > 1 && (
              <div className="flex items-center bg-neutral-900/90 border border-neutral-800 rounded-xl px-2 py-1 z-30">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-7 h-7 text-gold font-bold text-sm flex items-center justify-center active:scale-90"
                >
                  -
                </button>
                <span className="text-xs text-white px-1 font-bold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(numComensales, q + 1))}
                  className="w-7 h-7 text-gold font-bold text-sm flex items-center justify-center active:scale-90"
                >
                  +
                </button>
              </div>
            )}

            {/* BOTÓN SELECCIONAR */}
            <button
              type="button"
              onClick={() => onSelectDish(dish, quantity)}
              onTouchEnd={(e) => {
                e.preventDefault();
                onSelectDish(dish, quantity);
              }}
              className="flex-1 py-3 bg-gold text-black font-bold text-[11px] uppercase tracking-wider rounded-xl shadow-lg shadow-gold/20 active:scale-95 transition-all touch-manipulation cursor-pointer z-30"
            >
              Seleccionar {quantity > 1 ? `(${quantity})` : ""}
            </button>
          </div>

        </div>
      </div>

    </section>
  );
}