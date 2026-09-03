"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  Stage,
  Layer,
  Rect,
  Text,
  Group,
  Image as KonvaImage,
  Transformer,
} from "react-konva";
import useImage from "use-image";
import { BG_BY_ID, backgroundTileDataUrl } from "../lib/backgrounds";

export const CARD_WIDTH = 480;
export const CARD_HEIGHT = 620;
export const CARD_BG = "#f6f1e4";

// Fondo de la tarjeta: color base (o color propio) + patrón repetido opcional.
function CardBackground({ bgId, bgColor }) {
  const bg = BG_BY_ID[bgId] || BG_BY_ID.plain;
  const dataUrl = useMemo(() => backgroundTileDataUrl(bg), [bg]);
  const [tile] = useImage(dataUrl || "");
  return (
    <>
      <Rect
        x={0}
        y={0}
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        fill={bgColor || bg.base}
        listening={false}
      />
      {tile && (
        <Rect
          x={0}
          y={0}
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          fillPatternImage={tile}
          fillPatternRepeat="repeat"
          fillPatternScaleX={0.5}
          fillPatternScaleY={0.5}
          listening={false}
        />
      )}
    </>
  );
}

// Sticker o imagen subida. Va dentro de un Group con un Rect transparente
// que SIEMPRE tiene área de clic (aunque el SVG aún no haya cargado).
function CanvasImage({ el, onSelect, onChange, onTransformEnd, refCb }) {
  const [img] = useImage(el.src, "anonymous");
  return (
    <Group
      id={el.id}
      x={el.x}
      y={el.y}
      width={el.width}
      height={el.height}
      offsetX={el.width / 2}
      offsetY={el.height / 2}
      rotation={el.rotation || 0}
      scaleX={el.scaleX || 1}
      scaleY={el.scaleY || 1}
      draggable
      onClick={() => onSelect(el.id)}
      onTap={() => onSelect(el.id)}
      onDragStart={() => onSelect(el.id)}
      onDragEnd={(e) =>
        onChange(el.id, { x: e.target.x(), y: e.target.y() }, { commit: true })
      }
      onTransformEnd={() => onTransformEnd(el)}
      ref={refCb}
    >
      <Rect width={el.width} height={el.height} fill="transparent" />
      <KonvaImage
        image={img}
        width={el.width}
        height={el.height}
        listening={false}
        perfectDrawEnabled={false}
      />
    </Group>
  );
}

export default function CardCanvas({
  elements,
  background,
  backgroundColor,
  selectedId,
  onSelect,
  onChange,
  onEditText,
  stageRef,
}) {
  const nodeRefs = useRef({});
  const refCbs = useRef({});
  const trRef = useRef(null);

  // Callback de ref estable por id (evita que React lo llame con null en cada render).
  const getRefCb = (id) => {
    if (!refCbs.current[id]) {
      refCbs.current[id] = (node) => {
        if (node) nodeRefs.current[id] = node;
        else delete nodeRefs.current[id];
      };
    }
    return refCbs.current[id];
  };

  // Adjunta el Transformer al nodo seleccionado y fuerza el repintado del
  // grafo de "hit" tras cada cambio: Konva no siempre lo actualiza al
  // añadir/quitar nodos, y entonces los elementos nuevos no son clicables.
  useEffect(() => {
    const tr = trRef.current;
    if (!tr) return;
    const node = selectedId ? nodeRefs.current[selectedId] : null;
    tr.nodes(node ? [node] : []);
    const layer = tr.getLayer();
    if (layer) {
      layer.draw(); // escena + hit, síncrono
    }
  }, [elements, selectedId, background, backgroundColor]);

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
        border: "1px solid rgba(42,38,32,0.12)",
        borderRadius: 4,
        touchAction: "none",
      }}
    >
      <Layer>
        <CardBackground bgId={background} bgColor={backgroundColor} />

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
                onClick={() => onSelect(el.id)}
                onTap={() => onSelect(el.id)}
                onDragStart={() => onSelect(el.id)}
                onDblClick={() => onEditText(el.id)}
                onDblTap={() => onEditText(el.id)}
                onDragEnd={(e) =>
                  onChange(el.id, { x: e.target.x(), y: e.target.y() }, { commit: true })
                }
                onTransformEnd={() => handleTransformEnd(el)}
                ref={getRefCb(el.id)}
              />
            );
          }
          return (
            <CanvasImage
              key={el.id}
              el={el}
              onSelect={onSelect}
              onChange={onChange}
              onTransformEnd={handleTransformEnd}
              refCb={getRefCb(el.id)}
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
