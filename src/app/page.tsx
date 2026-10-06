"use client";

import dynamic from "next/dynamic";

// Las notas viven en LocalStorage, que solo existe en el navegador,
// así que este componente no se renderiza en el servidor.
const Notas = dynamic(() => import("./Notas"), { ssr: false });

export default function Home() {
  return <Notas />;
}
