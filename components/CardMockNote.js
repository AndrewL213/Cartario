"use client";

import { useEffect, useState } from "react";

// Mensaje decorativo de la carta del hero. Cambia en cada visita.
const MESSAGES = [
  ["Feliz cumpleaños,", "Ana"],
  ["Gracias por todo,", "abuela"],
  ["Te quiero", "un montón"],
  ["Que se cumpla", "todo lo bueno"],
  ["Enhorabuena,", "lo lograste"],
  ["Vuelve pronto,", "te echo de menos"],
  ["Feliz aniversario,", "mi vida"],
  ["Ánimo,", "tú puedes con esto"],
  ["Bienvenida", "al mundo, peque"],
  ["Solo por ser", "quien eres"],
  ["Feliz Navidad,", "familia"],
  ["Buen viaje,", "escríbeme"],
];

export default function CardMockNote({ className }) {
  // En el servidor y en el primer render se usa el primero (sin parpadeo de
  // hidratación); tras montar se elige uno al azar.
  const [msg, setMsg] = useState(MESSAGES[0]);

  useEffect(() => {
    setMsg(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
  }, []);

  return (
    <span className={className}>
      {msg[0]}
      <br />
      {msg[1]}
    </span>
  );
}
