"use client";

import { useRef, useState } from "react";
import { Stage, Layer, Rect, Text, Circle, Transformer } from "react-konva";

const CARD_WIDTH = 480;
const CARD_HEIGHT = 620;

let idCounter = 0;
const nextId = () => `el-${idCounter++}`;

export default function CardCanvas({ isPremiumUnlocked, onRequestUnlock }) {
  const [elements, setElements] = useState([
    {
      id: nextId(),
      type: "text",
      x: 90,
      y: 260,
      text: "Feliz cumpleaños",
      fontSize: 32,
      fontFamily: "Fraunces",
      fill: "#2a2620",
      draggable: true,
    },
  ]);
  const [selectedId, setSelectedId] = useState(null);
  const trRef = useRef(null);
  const shapeRefs = useRef({});
  const stageRef = useRef(null);

  const freeStickerColor = "#6e7f5c";
  const premiumStickerColors = ["#b4614f", "#c99a3d", "#5b6ea3"];

  const addText = () => {
    const el = {
      id: nextId(),
      type: "text",
      x: 60,
      y: 100 + elements.length * 10,
      text: "Escribe aquí",
      fontSize: 24,
      fontFamily: "Inter",
      fill: "#2a2620",
      draggable: true,
    };
    setElements((prev) => [...prev, el]);
  };

  const addSticker = (premium) => {
    if (premium && !isPremiumUnlocked) {
      onRequestUnlock();
      return;
    }
    const color = premium
      ? premiumStickerColors[
          Math.floor(Math.random() * premiumStickerColors.length)
        ]
      : freeStickerColor;
    const el = {
      id: nextId(),
      type: "sticker",
      x: 120 + Math.random() * 200,
      y: 120 + Math.random() * 200,
      radius: 16,
      fill: color,
      draggable: true,
    };
    setElements((prev) => [...prev, el]);
  };

  const updateElement = (id, attrs) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...attrs } : el))
    );
  };

  const handleSelect = (id) => setSelectedId(id);

  const handleTextDblClick = (el) => {
    const newText = window.prompt("Editar texto", el.text);
    if (newText !== null) {
      updateElement(el.id, { text: newText });
    }
  };

  const handleExport = () => {
    if (!stageRef.current) return;
    const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
    const link = document.createElement("a");
    link.download = "tarjeta.png";
    link.href = uri;
    link.click();
  };

  return (
    <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
      <div>
        <Stage
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          ref={stageRef}
          onMouseDown={(e) => {
            if (e.target === e.target.getStage()) setSelectedId(null);
          }}
          style={{
            background: "#f6f1e4",
            border: "1px solid rgba(42,38,32,0.12)",
            borderRadius: 4,
          }}
        >
          <Layer>
            <Rect
              x={0}
              y={0}
              width={CARD_WIDTH}
              height={CARD_HEIGHT}
              fill="#f6f1e4"
            />
            {elements.map((el) => {
              if (el.type === "text") {
                return (
                  <Text
                    key={el.id}
                    id={el.id}
                    text={el.text}
                    x={el.x}
                    y={el.y}
                    fontSize={el.fontSize}
                    fontFamily={el.fontFamily}
                    fill={el.fill}
                    draggable
                    onClick={() => handleSelect(el.id)}
                    onTap={() => handleSelect(el.id)}
                    onDblClick={() => handleTextDblClick(el)}
                    onDragEnd={(e) =>
                      updateElement(el.id, {
                        x: e.target.x(),
                        y: e.target.y(),
                      })
                    }
                    ref={(node) => {
                      if (node) shapeRefs.current[el.id] = node;
                    }}
                  />
                );
              }
              return (
                <Circle
                  key={el.id}
                  id={el.id}
                  x={el.x}
                  y={el.y}
                  radius={el.radius}
                  fill={el.fill}
                  draggable
                  onClick={() => handleSelect(el.id)}
                  onTap={() => handleSelect(el.id)}
                  onDragEnd={(e) =>
                    updateElement(el.id, {
                      x: e.target.x(),
                      y: e.target.y(),
                    })
                  }
                  ref={(node) => {
                    if (node) shapeRefs.current[el.id] = node;
                  }}
                />
              );
            })}
          </Layer>
        </Stage>
      </div>

      <div style={{ minWidth: 220, display: "flex", flexDirection: "column", gap: 12 }}>
        <button onClick={addText} style={toolBtn}>
          + Añadir texto
        </button>
        <button onClick={() => addSticker(false)} style={toolBtn}>
          + Sticker básico
        </button>
        <button
          onClick={() => addSticker(true)}
          style={{ ...toolBtn, borderColor: "#b4614f", color: "#954c3d" }}
        >
          + Sticker premium {!isPremiumUnlocked && "🔒"}
        </button>
        <button onClick={handleExport} style={{ ...toolBtn, marginTop: 12 }}>
          Descargar PNG
        </button>
        <p style={{ fontSize: 13, color: "#55503f", lineHeight: 1.5 }}>
          Doble clic sobre un texto para editarlo. Arrastra cualquier
          elemento para moverlo.
        </p>
      </div>
    </div>
  );
}

const toolBtn = {
  padding: "10px 16px",
  fontSize: 14,
  fontWeight: 500,
  borderRadius: 4,
  border: "1px solid rgba(42,38,32,0.2)",
  background: "#fff",
  color: "#2a2620",
  cursor: "pointer",
  textAlign: "left",
};
