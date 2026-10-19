import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

interface TilingBackgroundProps {
  patternSrc: string;
  maxTiles?: number;
  spacing?: number;
}

const GridTiling = ({
  patternSrc,
  maxTiles = 200,
  spacing = 2,
}: TilingBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pathname = usePathname();

  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname redraws the tiling on navigation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    canvas.width = screenWidth * dpr;
    canvas.height = screenHeight * dpr;
    canvas.style.width = `${screenWidth}px`;
    canvas.style.height = `${screenHeight}px`;

    ctx.scale(dpr, dpr);

    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, screenWidth, screenHeight);

    const image = new Image();
    image.src = patternSrc;

    image.onload = () => {
      const tileSizes = [
        [image.width, image.height],
        [image.height, image.width],
      ];
      const maxTileWidth = Math.max(tileSizes[0][0], tileSizes[1][0]);
      const maxTileHeight = Math.max(tileSizes[0][1], tileSizes[1][1]);

      const cellWidth = maxTileWidth + spacing;
      const cellHeight = maxTileHeight + spacing;

      const cols = Math.floor(screenWidth / cellWidth);
      const rows = Math.floor(screenHeight / cellHeight);

      const cells: { x: number; y: number }[] = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          cells.push({ x: col * cellWidth, y: row * cellHeight });
        }
      }

      for (let i = cells.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cells[i], cells[j]] = [cells[j], cells[i]];
      }

      const tilesToPlace = Math.min(maxTiles, cells.length);

      for (let i = 0; i < tilesToPlace; i++) {
        const cell = cells[i];

        const rotate = [0, 90, 180, 270][Math.floor(Math.random() * 4)];
        const flipX = Math.random() < 0.5;
        const flipY = Math.random() < 0.5;

        let w = image.width;
        let h = image.height;
        if (rotate === 90 || rotate === 270) [w, h] = [h, w];

        const offCanvas = document.createElement("canvas");
        offCanvas.width = w;
        offCanvas.height = h;
        const oCtx = offCanvas.getContext("2d");
        if (!oCtx) continue;

        oCtx.clearRect(0, 0, w, h);
        oCtx.save();
        oCtx.translate(w / 2, h / 2);
        oCtx.rotate((rotate * Math.PI) / 180);
        oCtx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
        oCtx.drawImage(image, -image.width / 2, -image.height / 2);
        oCtx.restore();

        const maxOffsetX = cellWidth - w;
        const maxOffsetY = cellHeight - h;

        const offsetX = maxOffsetX > 0 ? Math.random() * maxOffsetX : 0;
        const offsetY = maxOffsetY > 0 ? Math.random() * maxOffsetY : 0;

        const drawX = cell.x + offsetX;
        const drawY = cell.y + offsetY;

        ctx.drawImage(offCanvas, drawX, drawY);
      }
    };
  }, [pathname, patternSrc, maxTiles, spacing]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        pointerEvents: "none",
        userSelect: "none",
      }}
    />
  );
};

export default GridTiling;
