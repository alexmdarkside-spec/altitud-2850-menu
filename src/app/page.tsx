"use client";

export default function Page() {
  return (
    <div style={{ padding: "50px", textAlign: "center", backgroundColor: "#111", color: "#fff", height: "100vh" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>PRUEBA DIRECTA DE TOUCH</h1>
      <button
        type="button"
        onClick={() => alert("¡EL TÁCTIL Y REACT FUNCIONAN!")}
        style={{
          padding: "20px 40px",
          fontSize: "20px",
          backgroundColor: "#d4af37",
          color: "#000",
          border: "none",
          borderRadius: "10px",
          marginTop: "30px",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        TOCAR AQUÍ
      </button>
    </div>
  );
}
