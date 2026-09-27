"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import menuData from "../data/menu.json";
import MobileFullDish from "../components/MobileFullDish";

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

export default function Home() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [step, setStep] = useState<"ocasion" | "entrada" | "fuerte" | "postre" | "revelacion">("ocasion");
  const [ocasion, setOcasion] = useState("");
  const [numComensales, setNumComensales] = useState(1);

  const [selectedEntrada, setSelectedEntrada] = useState<Dish | null>(null);
  const [selectedFuertes, setSelectedFuertes] = useState<Dish[]>([]);
  const [selectedPostre, setSelectedPostre] = useState<Dish | null>(null);

  const [opcionesEntrada, setOpcionesEntrada] = useState<Dish[]>([]);
  const [opcionesFuerte, setOpcionesFuerte] = useState<{ dish: Dish; score: number }[]>([]);
  const [opcionesPostre, setOpcionesPostre] = useState<Dish[]>([]);

  const [pairingData, setPairingData] = useState<{ maridajeSugerido: string; notaCataSommelier: string } | null>(null);

  // --- States for Dish History & Transition ---
  const [selectedDishHistory, setSelectedDishHistory] = useState<Dish | null>(null);
  const [showTransition, setShowTransition] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isSendingOrder, setIsSendingOrder] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const rawList: Dish[] = useMemo(() => {
    if (Array.isArray(menuData)) return menuData as Dish[];
    return [];
  }, []);

  const calculateMatchScore = (entrada: Dish, fuerte: Dish): number => {
    const entNombre = entrada.nombre.toLowerCase();
    const entEstilo = entrada.estilo.map((e) => e.toLowerCase());
    const fueNombre = fuerte.nombre.toLowerCase();

    let score = 50;
    if (entNombre.includes("encebollado") || entNombre.includes("ceviche")) {
      if (fueNombre.includes("pesca") || fueNombre.includes("encocado")) score += 45;
      else if (fueNombre.includes("seco")) score += 30;
      else if (fueNombre.includes("fritada")) score -= 20;
    }
    else if (entNombre.includes("locro") || entNombre.includes("yaguarlocro")) {
      if (fueNombre.includes("fritada") || fueNombre.includes("seco")) score += 45;
      else if ( fueNombre.includes("encocado")) score += 15;
      else if (fueNombre.includes("pesca")) score -= 10;
    }
    if (entEstilo.includes("fresco") && fuerte.estilo.map((e) => e.toLowerCase()).includes("tropical")) {
      score += 10;
    }
    return Math.min(Math.max(score, 10), 99);
  };

  const handleSelectOcasion = (o: string) => {
    setOcasion(o);
    const entradas = rawList.filter(
      (p) => p.categoria === "Entradas" && p.ocasion.some((loc) => loc.toLowerCase().includes(o.toLowerCase()))
    );
    const pool = entradas.length >= 2 ? entradas : rawList.filter((p) => p.categoria === "Entradas");
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    setOpcionesEntrada(shuffled.slice(0, 2));
    setStep("entrada");
  };

  const handleSelectEntrada = (dish: Dish) => {
    setSelectedEntrada(dish);
    const fuertes = rawList.filter((p) => p.categoria === "Platos Fuertes");
    const scoredFuertes = fuertes.map((fuerte) => ({
      dish: fuerte,
      score: calculateMatchScore(dish, fuerte),
    }));
    scoredFuertes.sort((a, b) => b.score - a.score);
    setOpcionesFuerte(scoredFuertes);
    setStep("fuerte");
  };

  const handleToggleFuerte = (dish: Dish) => {
    setSelectedFuertes(prev => {
      const exists = prev.find(d => d.id === dish.id);
      if (exists) {
        if (prev.length < numComensales) {
          return [...prev, dish];
        }
        return prev.filter(d => d.id !== dish.id);
      }
      if (prev.length >= numComensales) return prev;
      return [...prev, dish];
    });
  };

  const handleConfirmFuertes = () => {
    if (selectedFuertes.length === 0) return;
    const postres = rawList.filter((p) => p.categoria === "Postres");
    const entNombre = (selectedEntrada?.nombre || "").toLowerCase();
    const scoredPostres = postres.map((postre) => {
      let score = 50;
      const pEstilo = postre.estilo.map((e) => e.toLowerCase());
      if (entNombre.includes("encebollado") || entNombre.includes("ceviche")) {
        if (pEstilo.includes("frutal") || pEstilo.includes("sutil")) score += 40;
      } else {
        if (pEstilo.includes("tradicional") || pEstilo.includes("crocante")) score += 40;
      }
      return { postre, score };
    });
    scoredPostres.sort((a, b) => b.score - a.score);
    setOpcionesPostre(scoredPostres.slice(0, 3).map((p) => p.postre));
    setStep("postre");
  };

  const handleSelectPostre = (dish: Dish) => {
    setSelectedPostre(dish);
    setPairingData({
      maridajeSugerido: selectedFuertes[0]?.maridaje || dish.maridaje,
      notaCataSommelier: `Maridaje estructurado para equilibrar los perfiles de ${selectedEntrada?.nombre} y ${selectedFuertes[0]?.nombre}.`,
    });
    setStep("revelacion");
  };

  const handleOpenDrawer = () => {
    setStep("ocasion");
    setOcasion("");
    setNumComensales(1);
    setSelectedEntrada(null);
    setSelectedFuertes([]);
    setSelectedPostre(null);
    setPairingData(null);
    setIsDrawerOpen(true);
  };

  const handleDishClick = (dish: Dish) => {
    setSelectedDishHistory(dish);
    setShowTransition(true);
    setTimeout(() => {
      setShowTransition(false);
      setShowHistoryModal(true);
    }, 900);
  };

  const handleSendToKitchen = () => {
    setIsSendingOrder(true);
    setTimeout(() => {
      setIsSendingOrder(false);
      setToast("¡Orden recibida en cocina! Preparando tu experiencia gastronómica.");
      setShowHistoryModal(false);
      setTimeout(() => setToast(null), 4000);
    }, 1000);
  };

  const cardStyles = "border border-neutral-800 hover:border-gold hover:shadow-[0_0_20px_rgba(212,175,55,0.25)] transition-all duration-300 cursor-pointer";

  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-gold/30 selection:text-gold overflow-x-hidden">

      {/* ELEGANT SIDE VIGNETTES */}
      <div className="pointer-events-none fixed inset-y-0 left-0 w-12 bg-gradient-to-r from-[#080808] to-transparent z-40" />
      <div className="pointer-events-none fixed inset-y-0 right-0 w-12 bg-gradient-to-l from-[#080808] to-transparent z-40" />

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[10000] bg-gold text-black px-6 py-3 rounded-full font-bold shadow-2xl animate-bounce pointer-events-auto relative z-[10000]">
          {toast}
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative w-full min-h-[80vh] flex flex-col items-center justify-center text-center px-4 bg-[url('/images/hero-bg.webp')] bg-cover bg-center pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-[#080808] pointer-events-none" />
        <div className="relative z-10 max-w-3xl flex flex-col items-center gap-6 pointer-events-none">
          <h1 className="font-syne text-5xl md:text-7xl font-bold tracking-tight">
            ALTITUD <span className="text-gold">2850</span>
          </h1>
          <p className="text-base md:text-xl text-neutral-300">
            Diseñador de Menús Inteligente & Neotradicional
          </p>
          <button
            onClick={handleOpenDrawer}
            className="px-8 py-4 bg-gold text-black font-bold rounded-full transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-gold/20 touch-manipulation cursor-pointer relative z-30 pointer-events-auto"
          >
            Diseñar Menú Personalizado
          </button>
        </div>
      </section>

      {/* CARTA GENERAL - Responsive Layout */}
      <main className="max-w-6xl mx-auto py-16 px-6">
        <h2 className="text-2xl font-syne font-bold mb-8 border-b border-neutral-800 pb-4 md:block sticky top-0 z-20 bg-[#080808]/80 backdrop-blur-sm">Nuestra Carta</h2>

        {/* DESKTOP VIEW: Elegant Grid */}
        <div className="hidden md:grid grid-cols-3 gap-6">
          {rawList.map((dish) => (
            <div
              key={dish.id}
              onClick={() => handleDishClick(dish)}
              className={`bg-neutral-900 rounded-2xl p-4 flex flex-col justify-between ${cardStyles}`}
            >
              <div className="relative overflow-hidden rounded-xl mb-3 aspect-square">
                <img src={dish.imagen} alt={dish.nombre} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-gold font-bold uppercase tracking-wider">{dish.categoria}</span>
                  <span className="text-xs font-bold text-white">${dish.precio}</span>
                </div>
                <h3 className="font-syne font-bold text-base text-white">{dish.nombre}</h3>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">{dish.descripcion}</p>
              </div>
            </div>
          ))}
        </div>

        {/* MOBILE VIEW: Full-Screen Immersive Slider */}
        <div className="block md:hidden h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth">
          {rawList.map((dish) => (
            <MobileFullDish
              key={dish.id}
              dish={dish}
              numComensales={numComensales}
              onSelectDish={(dish, qty) => {
                for(let i=0; i<qty; i++) {
                  handleToggleFuerte(dish);
                }
              }}
              onOpenHistory={() => handleDishClick(dish)}
            />
          ))}
        </div>
      </main>

      {/* TRANSITION OVERLAY (VIRGEN) */}
      {showTransition && (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none">
          <img
            src="/images/virgen-panecillo.webp"
            alt="Virgen del Panecillo"
            className="w-auto h-auto max-h-[75vh] max-w-[85vw] object-contain drop-shadow-[0_0_30px_rgba(212,175,55,0.35)] pointer-events-none"
            style={{ animation: 'fadeScale 900ms forwards' }}
          />
          <span className="text-gold font-syne text-xs uppercase tracking-[0.3em] mt-6 opacity-90 pointer-events-none">Cargando Experiencia...</span>
          <style>{`
            @keyframes fadeScale {
              0% { opacity: 0; transform: scale(0.8); }
              50% { opacity: 1; transform: scale(1); }
              100% { opacity: 0; transform: scale(1.1); }
            }
          `}</style>
        </div>
      )}

      {/* HISTORY MODAL (FULL SCREEN) */}
      {showHistoryModal && selectedDishHistory && (
        <div className="fixed inset-0 z-[9998] bg-[#080808] overflow-y-auto">
          <button
            onClick={() => setShowHistoryModal(false)}
            className="fixed top-8 right-8 z-50 text-white/50 hover:text-white text-2xl"
          >
            ✕
          </button>
          <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 md:p-16 flex flex-col justify-center space-y-8 max-w-2xl mx-auto lg:mx-0">
              <div className="space-y-2">
                <span className="text-gold font-bold uppercase tracking-widest text-sm">{selectedDishHistory.categoria}</span>
                <h2 className="text-5xl md:text-7xl font-syne font-bold text-white">{selectedDishHistory.nombre}</h2>
              </div>

              <div className="space-y-4">
                <div className="border-l-2 border-gold pl-4">
                  <h4 className="text-gold font-bold uppercase text-xs tracking-tighter">Origen Neotradicional</h4>
                  <p className="text-neutral-300 text-lg italic">Inspiración en los sabores ancestrales de los Andes ecuatorianos, reinterpretados para la alta cocina.</p>
                </div>
                <p className="text-neutral-400 text-lg leading-relaxed">{selectedDishHistory.descripcion}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <h4 className="text-gold font-bold uppercase text-xs">Ingredientes Principales</h4>
                  <ul className="text-sm text-neutral-400 list-disc list-inside">
                    {selectedDishHistory.ingredientes.map((ing, i) => <li key={i}>{ing}</li>)}
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="text-gold font-bold uppercase text-xs">Maridaje Sugerido</h4>
                  <p className="text-sm text-neutral-300">{selectedDishHistory.maridaje}</p>
                </div>
              </div>

              <button
                onClick={handleSendToKitchen}
                disabled={isSendingOrder}
                className="group relative px-8 py-4 bg-gold text-black font-bold rounded-full text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 disabled:opacity-70"
              >
                <span className="relative z-10">
                  {isSendingOrder ? "Enviando comanda a la cocina del Chef..." : "Enviar Orden a Cocina"}
                </span>
                {isSendingOrder && (
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                )}
              </button>
            </div>

            <div className="relative h-screen w-full bg-neutral-900">
              <img
                src={selectedDishHistory.imagen}
                alt={selectedDishHistory.nombre}
                className="w-full h-full object-cover opacity-80 blur-0 transition-all duration-500"
                style={{ maskImage: 'radial-gradient(circle, black 60%, transparent 100%)' }}
              />
              <div className="absolute bottom-16 right-16 text-right">
                <span className="text-6xl font-syne font-bold text-gold">${selectedDishHistory.precio}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL IA (The existing Designer) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="bg-[#121216] border border-gold/30 rounded-3xl max-w-5xl w-full p-6 md:p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto">

            <button
              onClick={() => setIsDrawerOpen(false)}
              className="absolute top-6 right-6 text-neutral-400 hover:text-white w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center"
            >
              ✕
            </button>

            {/* PASO 0: OCASIÓN & COMENSALES */}
            {step === "ocasion" && (
              <div className="text-center py-6">
                <span className="text-[10px] tracking-widest text-gold font-bold uppercase">Paso 1 de 4</span>
                <h2 className="text-2xl font-syne font-bold mt-2 mb-6">Diseñemos tu Experiencia</h2>

                <div className="space-y-8 max-w-lg mx-auto">
                  <div className="space-y-4">
                    <p className="text-xs text-neutral-400 uppercase tracking-wider">¿Cuál es la ocasión?</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {["Cita", "Reunión de Negocios", "Celebración", "Experiencia Local"].map((o) => (
                        <button
                          key={o}
                          onClick={() => handleSelectOcasion(o)}
                          className={`p-4 bg-neutral-900 rounded-2xl text-xs font-medium transition-all ${ocasion === o ? 'border-gold text-gold shadow-[0_0_10px_rgba(197,160,89,0.2)]' : 'border-neutral-800 text-white hover:border-gold/50'}`}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs text-neutral-400 uppercase tracking-wider">¿Cuántos comensales nos acompañan hoy?</p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {[1, 2, 3].map((n) => (
                        <button
                          key={n}
                          onClick={() => setNumComensales(n === 3 ? 3 : n)}
                          className={`px-6 py-3 rounded-full text-xs font-bold transition-all ${numComensales === n ? 'bg-gold text-black' : 'bg-neutral-900 border border-neutral-800 text-white hover:border-gold/50'}`}
                        >
                          {n === 3 ? "3+ Personas" : `${n} Persona${n > 1 ? 's' : ''}`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => { if(ocasion) setStep("entrada") }}
                  disabled={!ocasion}
                  className="mt-10 px-10 py-4 bg-gold text-black font-bold rounded-full text-xs uppercase tracking-widest disabled:opacity-50 transition-transform hover:scale-105"
                >
                  Continuar
                </button>
              </div>
            )}

            {/* PASO 1: 2 ENTRADAS AL AZAR */}
            {step === "entrada" && (
              <div className="text-center">
                <span className="text-[10px] tracking-widest text-gold font-bold uppercase">Paso 2 de 4</span>
                <h2 className="text-2xl font-syne font-bold mt-1 mb-6">Elige tu Entrada</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                  {opcionesEntrada.map((dish) => (
                    <div
                      key={dish.id}
                      onClick={() => handleSelectEntrada(dish)}
                      className={`bg-neutral-900 rounded-2xl p-4 text-left transition-all group ${cardStyles}`}
                    >
                      <img src={dish.imagen} alt={dish.nombre} className="w-full h-40 object-cover rounded-xl mb-3" />
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-syne font-bold text-sm text-white group-hover:text-gold">{dish.nombre}</h3>
                        <span className="text-xs text-gold font-bold">${dish.precio}</span>
                      </div>
                      <p className="text-xs text-neutral-400">{dish.descripcion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PASO 2: PLATOS FUERTES (Soporte Múltiples Comensales) */}
            {step === "fuerte" && (
              <div className="text-center">
                <span className="text-[10px] tracking-widest text-gold font-bold uppercase">Paso 3 de 4</span>
                <h2 className="text-2xl font-syne font-bold mt-1 mb-1">Elige tu Plato Fuerte</h2>
                <p className="text-xs text-gold/80 mb-6">
                  Sugerencias para {numComensales} comensal{numComensales > 1 ? 'es' : ''} basadas en tu {selectedEntrada?.nombre}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {opcionesFuerte.map(({ dish, score }, index) => {
                    const isSelected = selectedFuertes.some(d => d.id === dish.id);
                    const dishIndex = selectedFuertes.findIndex(d => d.id === dish.id);

                    return (
                      <div
                        key={dish.id}
                        onClick={() => handleToggleFuerte(dish)}
                        className={`bg-neutral-900 rounded-2xl p-3 text-left transition-all flex flex-col justify-between relative overflow-hidden group ${cardStyles} ${isSelected ? 'border-gold ring-1 ring-gold' : ''}`}
                      >
                        {index < 2 && (
                          <span className="absolute top-2 right-2 bg-gold text-black text-[9px] font-bold px-2 py-0.5 rounded-full z-10 shadow">
                            Match {score}%
                          </span>
                        )}
                        {isSelected && (
                          <span className="absolute top-2 left-2 bg-white text-black text-[9px] font-bold px-2 py-0.5 rounded-full z-10">
                            Plato {dishIndex + 1}
                          </span>
                        )}
                        <div>
                          <img src={dish.imagen} alt={dish.nombre} className="w-full h-32 object-cover rounded-xl mb-2" />
                          <h3 className="font-syne font-bold text-xs text-white group-hover:text-gold">{dish.nombre}</h3>
                          <p className="text-[10px] text-neutral-400 mt-1 leading-normal">{dish.descripcion}</p>
                        </div>
                        <span className="text-xs font-bold text-gold mt-2 block">${dish.precio}</span>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleConfirmFuertes}
                  disabled={selectedFuertes.length === 0}
                  className="mt-8 px-10 py-4 bg-gold text-black font-bold rounded-full text-xs uppercase tracking-widest disabled:opacity-50 transition-transform hover:scale-105"
                >
                  Confirmar Selección
                </button>
              </div>
            )}

            {/* PASO 3: 3 POSTRES */}
            {step === "postre" && (
              <div className="text-center">
                <span className="text-[10px] tracking-widest text-gold font-bold uppercase">Paso 4 de 4</span>
                <h2 className="text-2xl font-syne font-bold mt-1 mb-6">Elige tu Postre</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  {opcionesPostre.map((dish) => (
                    <div
                      key={dish.id}
                      onClick={() => handleSelectPostre(dish)}
                      className={`bg-neutral-900 rounded-2xl p-4 text-left transition-all group ${cardStyles}`}
                    >
                      <img src={dish.imagen} alt={dish.nombre} className="w-full h-36 object-cover rounded-xl mb-3" />
                      <h3 className="font-syne font-bold text-xs text-white group-hover:text-gold">{dish.nombre}</h3>
                      <p className="text-[11px] text-neutral-400 mt-1">{dish.descripcion}</p>
                      <span className="text-xs font-bold text-gold mt-2 block">${dish.precio}</span>
                      </div>
                  ))}
                </div>
              </div>
            )}

            {/* PASO 4: REVELACIÓN Y MARIDAJE */}
            {step === "revelacion" && (
              <div className="text-center py-2">
                <h2 className="text-2xl font-syne font-bold mb-6 text-gold">Tu Experiencia de Menú</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {[
                    { label: "ENTRADA", dish: selectedEntrada },
                    { label: "PLATOS FUERTES", dish: selectedFuertes[0] }, // Simplified for view
                    { label: "POSTRE", dish: selectedPostre },
                  ].map(({ label, dish }, i) => (
                    <div key={i} className={`bg-neutral-900 rounded-2xl p-3 text-left ${cardStyles}`}>
                      <span className="text-[9px] font-bold text-gold uppercase block mb-1">{label}</span>
                      <img src={dish?.imagen} alt={dish?.nombre} className="w-full h-28 object-cover rounded-xl mb-2" />
                      <h4 className="font-syne font-bold text-xs text-white">{dish?.nombre}</h4>
                      <span className="text-xs text-neutral-400 font-bold">${dish?.precio}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-neutral-900 border border-gold/30 rounded-2xl p-5 mb-6 text-left">
                  <span className="text-[9px] uppercase tracking-widest text-gold font-bold">Sugerencia del Sommelier</span>
                  <h3 className="text-sm font-syne font-bold text-white mt-1">{pairingData?.maridajeSugerido}</h3>
                  <p className="text-xs text-neutral-400 italic mt-1">{pairingData?.notaCataSommelier}</p>
                </div>

                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-8 py-3 bg-gold text-black font-bold rounded-full text-xs uppercase tracking-widest hover:scale-105 transition-transform"
                >
                  Confirmar Menú
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
