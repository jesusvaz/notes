"use client";

import { useState } from "react";

type Nota = {
  versiculo: number;
  nota: string;
  fecha: number; // momento en que se guardó (ms)
};

const STORAGE_KEY = "mis_notas_versiculos";
const INICIO_KEY = "mis_notas_inicio"; // fecha de la primera nota

// Fecha en la que caducan las notas: un mes después de la primera
function fechaExpiracion(inicio: number) {
  const fecha = new Date(inicio);
  fecha.setMonth(fecha.getMonth() + 1);
  return fecha.getTime();
}

function leerNotas(): Nota[] {
  try {
    // Si ya pasó un mes desde la primera nota, se borran todas
    const inicio = Number(localStorage.getItem(INICIO_KEY));
    if (inicio && Date.now() >= fechaExpiracion(inicio)) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(INICIO_KEY);
      return [];
    }

    const guardadas = localStorage.getItem(STORAGE_KEY);
    if (!guardadas) return [];

    const ahora = Date.now();
    // Notas antiguas sin fecha reciben la fecha actual
    return (JSON.parse(guardadas) as Nota[]).map((n) => ({
      ...n,
      fecha: n.fecha ?? ahora,
    }));
  } catch {
    return [];
  }
}

function guardarNotas(notas: Nota[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notas));

  if (notas.length === 0) {
    localStorage.removeItem(INICIO_KEY);
  } else if (!localStorage.getItem(INICIO_KEY)) {
    const primera = Math.min(...notas.map((n) => n.fecha));
    localStorage.setItem(INICIO_KEY, String(primera));
  }
}

function formatearFecha(fecha: number) {
  return new Date(fecha).toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function Notas() {
  const [versiculo, setVersiculo] = useState("");
  const [nota, setNota] = useState("");
  // Se leen de LocalStorage una sola vez, al crear el estado
  const [notas, setNotas] = useState<Nota[]>(leerNotas);

  function actualizarNotas(nuevas: Nota[]) {
    setNotas(nuevas);
    guardarNotas(nuevas);
  }

  function agregarNota() {
    if (!versiculo) {
      alert("Selecciona un versículo.");
      return;
    }

    if (!nota.trim()) {
      alert("Escribe una nota.");
      return;
    }

    const nuevaNota: Nota = {
      versiculo: Number(versiculo),
      nota: nota.trim(),
      fecha: Date.now(),
    };

    actualizarNotas([...notas, nuevaNota]);

    setVersiculo("");
    setNota("");
  }

  function eliminarNota(index: number) {
    actualizarNotas(notas.filter((_, i) => i !== index));
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10 text-gray-900">
      <div className="mx-auto max-w-2xl">

        <h1 className="mb-8 text-center text-3xl font-bold">
          Mis Notas de estudio
        </h1>

        {/* Formulario */}
        <section className="mb-6 rounded-xl bg-white p-6 shadow">

          <label
            htmlFor="versiculo"
            className="mb-2 block font-semibold"
          >
            Párrafo
          </label>

          <select
            id="versiculo"
            value={versiculo}
            onChange={(e) => setVersiculo(e.target.value)}
            className="mb-5 w-full rounded-lg border border-gray-300 bg-white p-3"
          >
            <option value="">
              Selecciona un párrafo
            </option>

            {Array.from({ length: 20 }, (_, index) => (
              <option
                key={index + 1}
                value={index + 1}
              >
                Párrafo {index + 1}
              </option>
            ))}
          </select>

          <label
            htmlFor="nota"
            className="mb-2 block font-semibold"
          >
            Nota
          </label>

          <textarea
            id="nota"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Escribe tu nota aquí..."
            className="mb-5 min-h-32 w-full resize-y rounded-lg border border-gray-300 p-3"
          />

          <button
            type="button"
            onClick={agregarNota}
            className="w-full rounded-lg bg-teal-700 px-4 py-3 font-semibold text-white transition hover:bg-teal-800"
          >
            Agregar nota
          </button>
        </section>

        {/* Lista de notas */}
        <section className="rounded-xl bg-white p-6 shadow">

          <h2 className="mb-5 text-2xl font-bold">
            Mis notas
          </h2>

          {notas.length === 0 ? (
            <p className="py-6 text-center text-gray-500">
              Todavía no tienes notas.
            </p>
          ) : (
            <div className="space-y-4">

              {notas.map((item, index) => (
                <article
                  key={`${item.fecha}-${index}`}
                  className="rounded-lg border-l-4 border-teal-700 bg-gray-50 p-4"
                >
                  <h3 className="font-bold text-teal-700">
                    Párrafo {item.versiculo}
                  </h3>

                  <p className="mb-2 text-sm text-gray-500">
                    Guardada el {formatearFecha(item.fecha)}
                  </p>

                  <p className="whitespace-pre-wrap">
                    {item.nota}
                  </p>

                  <button
                    type="button"
                    onClick={() => eliminarNota(index)}
                    className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
                  >
                    Eliminar
                  </button>
                </article>
              ))}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}

