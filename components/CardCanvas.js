"use client";

import { useEffect, useRef } from "react";
import { Stage, Layer, Rect, Text, Image as KonvaImage, Transformer } from "react-konva";
import useImage from "use-image";

export const CARD_WIDTH = 480;
export const CARD_HEIGHT = 620;
export const CARD_BG = "#f6f1e4";

// Imagen (sticker o subida) como nodo de Konva.
function CanvasImage({ el, onSelect, onChange, onDragStart, onDragEnd, onTransformEnd, refCb }) {
  const [img] = useImage(el.src, "anonymous");
  return (
    <KonvaImage
      image={img}
      id={el.id}
      x={el.x}
      y={el.y}
      width={el.width}
      height={el.height}
      rotation={el.rotation || 0}
      scaleX={el.scaleX || 1}
      scaleY={el.scaleY || 1}
      offsetX={el.width / 2}
      offsetY={el.height / 2}
      draggable
      onMouseDown={() => onSelect(el.id)}
      onTouchStart={() => onSelect(el.id)}
      onDragStart={onDragStart}
      onDragMove={(e) => onChange(el.id, { x: e.target.x(), y: e.target.y() })}
      onDragEnd={(e) => {
        onChange(el.id, { x: e.target.x(), y: e.target.y() });
        onDragEnd();
      }}
      onTransformEnd={() => onTransformEnd(el)}
      ref={refCb}
    />
  );
}

export default function CardCanvas({
  elements,
  selectedId,
  onSelect,
  onChange,
  onDragStart,
  onDragEnd,
  onEditText,
  stageRef,
}) {
  const nodeRefs = useRef({});
  const trRef = useRef(null);

  // Adjunta el Transformer al nodo seleccionado.
  useEffect(() => {
    const tr = trRef.current;
    if (!tr) return;
    const node = selectedId ? nodeRefs.current[selectedId] : null;
    if (tr.nodes()[0] === node) return; // ya está donde toca; no redibujar
    tr.nodes(node ? [node] : []);
    tr.getLayer()?.batchDraw();
  }, [selectedId, elements]);

  const setRef = (id) => (node) => {
    if (node) nodeRefs.current[id] = node;
    else delete nodeRefs.current[id];
  };

  const handleTransformEnd = (el) => {
    const node = nodeRefs.current[el.id];
    if (!node) return;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);

    if (el.type === "text") {
      onChange(
        el.id,
        {
          x: node.x(),
          y: node.y(),
          rotation: node.rotation(),
          fontSize: Math.max(8, Math.round((el.fontSize || 24) * scaleY)),
          width: Math.max(24, Math.round((el.width || 240) * scaleX)),
        },
        { commit: true }
      );
    } else {
      onChange(
        el.id,
        {
          x: node.x(),
          y: node.y(),
          rotation: node.rotation(),
          scaleX: (el.scaleX || 1) * scaleX,
          scaleY: (el.scaleY || 1) * scaleY,
        },
        { commit: true }
      );
    }
  };

  const clearIfEmpty = (e) => {
    if (e.target === e.target.getStage()) onSelect(null);
  };

  return (
    <Stage
      width={CARD_WIDTH}
      height={CARD_HEIGHT}
      ref={stageRef}
      onMouseDown={clearIfEmpty}
      onTouchStart={clearIfEmpty}
      style={{
        background: CARD_BG,
        border: "1px solid rgba(42,38,32,0.12)",
        borderRadius: 4,
        touchAction: "none",
      }}
    >
      <Layer>
        <Rect x={0} y={0} width={CARD_WIDTH} height={CARD_HEIGHT} fill={CARD_BG} listening={false} />

        {elements.map((el) => {
          if (el.type === "text") {
            return (
              <Text
                key={el.id}
                id={el.id}
                text={el.text}
                x={el.x}
                y={el.y}
                width={el.width || 240}
                rotation={el.rotation || 0}
                fontSize={el.fontSize}
                fontFamily={el.fontFamily}
                fontStyle={el.fontStyle || "normal"}
                align={el.align || "left"}
                fill={el.fill}
                draggable
                onMouseDown={() => onSelect(el.id)}
                onTouchStart={() => onSelect(el.id)}
                onDblClick={() => onEditText(el.id)}
                onDblTap={() => onEditText(el.id)}
                onDragStart={onDragStart}
                onDragMove={(e) =>
                  onChange(el.id, { x: e.target.x(), y: e.target.y() })
                }
                onDragEnd={(e) => {
                  onChange(el.id, { x: e.target.x(), y: e.target.y() });
                  onDragEnd();
                }}
                onTransformEnd={() => handleTransformEnd(el)}
                ref={setRef(el.id)}
              />
            );
          }
          // sticker | image
          return (
            <CanvasImage
              key={el.id}
              el={el}
              onSelect={onSelect}
              onChange={onChange}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onTransformEnd={handleTransformEnd}
              refCb={setRef(el.id)}
            />
          );
        })}

        <Transformer
          ref={trRef}
          rotateEnabled
          keepRatio
          flipEnabled={false}
          anchorSize={10}
          anchorStroke="#b4614f"
          anchorFill="#fff"
          borderStroke="#b4614f"
          borderDash={[4, 3]}
          boundBoxFunc={(oldBox, newBox) =>
            newBox.width < 20 || newBox.height < 20 ? oldBox : newBox
          }
        />
      </Layer>
    </Stage>
  );
}
