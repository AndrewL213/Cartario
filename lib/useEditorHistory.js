"use client";

import { useCallback, useReducer } from "react";

// Historial de estados de `elements` para deshacer/rehacer.
// `present` es siempre la fuente de verdad que consume el editor.

const LIMIT = 50; // muy por encima del mínimo de 10 pedido

function reducer(state, action) {
  const { past, present, future } = state;
  switch (action.type) {
    case "set": {
      const next =
        typeof action.value === "function" ? action.value(present) : action.value;
      if (next === present) return state;
      return {
        past: [...past, present].slice(-LIMIT),
        present: next,
        future: [],
      };
    }
    case "replace": {
      // cambia el presente sin crear entrada de historial (p. ej. arrastre en curso)
      const next =
        typeof action.value === "function" ? action.value(present) : action.value;
      return { past, present: next, future };
    }
    case "checkpoint": {
      // registra `prev` como punto de retorno sin tocar el presente
      // (para agrupar una tanda de cambios transitorios en un solo "deshacer")
      if (action.prev === present) return state;
      return { past: [...past, action.prev].slice(-LIMIT), present, future: [] };
    }
    case "undo": {
      if (past.length === 0) return state;
      const previous = past[past.length - 1];
      return {
        past: past.slice(0, -1),
        present: previous,
        future: [present, ...future],
      };
    }
    case "redo": {
      if (future.length === 0) return state;
      const next = future[0];
      return {
        past: [...past, present],
        present: next,
        future: future.slice(1),
      };
    }
    case "reset":
      return { past: [], present: action.value, future: [] };
    default:
      return state;
  }
}

export function useEditorHistory(initial) {
  const [state, dispatch] = useReducer(reducer, {
    past: [],
    present: initial,
    future: [],
  });

  const commit = useCallback((value) => dispatch({ type: "set", value }), []);
  const replace = useCallback((value) => dispatch({ type: "replace", value }), []);
  const checkpoint = useCallback((prev) => dispatch({ type: "checkpoint", prev }), []);
  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const redo = useCallback(() => dispatch({ type: "redo" }), []);
  const reset = useCallback((value) => dispatch({ type: "reset", value }), []);

  return {
    elements: state.present,
    commit, // cambio que SÍ entra al historial
    replace, // cambio transitorio que NO entra al historial
    checkpoint, // agrupa una tanda de `replace` en un solo paso de deshacer
    undo,
    redo,
    reset, // recarga inicial (cargar tarjeta), limpia historial
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
}
