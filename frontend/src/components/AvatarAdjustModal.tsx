import React, { useEffect, useRef, useState, useCallback } from "react";
import { Sparkles, ZoomIn, RotateCcw, X, Check } from "lucide-react";

export interface AvatarAdjustModalProps {
  isOpen: boolean;
  imageSrc: string;
  onSave: (file: File) => Promise<void> | void;
  onCancel: () => void;
  saving?: boolean;
}

export const AvatarAdjustModal: React.FC<AvatarAdjustModalProps> = ({
  isOpen,
  imageSrc,
  onSave,
  onCancel,
  saving = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, initialOffsetX: 0, initialOffsetY: 0 });

  const CANVAS_SIZE = 260; // preview canvas dimensions in px
  const OUTPUT_SIZE = 400; // exported high-res avatar size in px

  // Smart Auto Adjust: analyzes pixel contrast from top to bottom
  const performAutoAdjust = useCallback((img: HTMLImageElement) => {
    const naturalWidth = img.naturalWidth || img.width;
    const naturalHeight = img.naturalHeight || img.height;

    // Calculate base cover scale
    const scale = Math.max(CANVAS_SIZE / naturalWidth, CANVAS_SIZE / naturalHeight);

    // Default center
    let initialX = (CANVAS_SIZE - naturalWidth * scale) / 2;
    let initialY = (CANVAS_SIZE - naturalHeight * scale) / 2;
    let autoZoom = 1.05;

    // For portrait images, human faces are almost always in the upper 20%-60%
    if (naturalHeight > naturalWidth) {
      try {
        const offscreen = document.createElement("canvas");
        const offCtx = offscreen.getContext("2d");
        if (offCtx) {
          const sampleW = 100;
          const sampleH = Math.round((naturalHeight / naturalWidth) * 100);
          offscreen.width = sampleW;
          offscreen.height = sampleH;
          offCtx.drawImage(img, 0, 0, sampleW, sampleH);

          const data = offCtx.getImageData(0, 0, sampleW, sampleH).data;

          // Background sample from first 5% of height
          let bgR = 0, bgG = 0, bgB = 0;
          const topRows = Math.max(2, Math.floor(sampleH * 0.05));
          let count = 0;
          for (let y = 0; y < topRows; y++) {
            for (let x = 0; x < sampleW; x++) {
              const idx = (y * sampleW + x) * 4;
              bgR += data[idx];
              bgG += data[idx + 1];
              bgB += data[idx + 2];
              count++;
            }
          }
          bgR /= count;
          bgG /= count;
          bgB /= count;

          // Scan down in the central column (x: 20% - 80%) to detect head/subject
          let headStartRatio = 0.3;
          for (let y = topRows; y < sampleH * 0.7; y++) {
            let diffSum = 0;
            const startX = Math.floor(sampleW * 0.25);
            const endX = Math.floor(sampleW * 0.75);
            for (let x = startX; x < endX; x++) {
              const idx = (y * sampleW + x) * 4;
              diffSum +=
                Math.abs(data[idx] - bgR) +
                Math.abs(data[idx + 1] - bgG) +
                Math.abs(data[idx + 2] - bgB);
            }
            const avgDiff = diffSum / (endX - startX);
            if (avgDiff > 40) {
              headStartRatio = y / sampleH;
              break;
            }
          }

          // Center the circle on the head area (approx 15% below head start)
          const targetCenterRatio = headStartRatio + 0.22;
          const targetCenterPx = naturalHeight * scale * targetCenterRatio;
          initialY = CANVAS_SIZE / 2 - targetCenterPx;
          autoZoom = 1.15;
        }
      } catch (err) {
        // Fallback: raise position so face is in center
        initialY = (CANVAS_SIZE - naturalHeight * scale) * 0.25;
      }
    }

    setZoom(autoZoom);
    setOffset({ x: initialX, y: initialY });
  }, []);

  // Load image whenever imageSrc or isOpen changes
  useEffect(() => {
    if (!isOpen || !imageSrc) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      performAutoAdjust(img);
    };
    img.src = imageSrc;
  }, [isOpen, imageSrc, performAutoAdjust]);

  // Redraw canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const naturalWidth = img.naturalWidth || img.width;
    const naturalHeight = img.naturalHeight || img.height;

    const baseScale = Math.max(CANVAS_SIZE / naturalWidth, CANVAS_SIZE / naturalHeight);
    const currentScale = baseScale * zoom;

    const drawW = naturalWidth * currentScale;
    const drawH = naturalHeight * currentScale;

    // Clear background
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw user image
    ctx.drawImage(img, offset.x, offset.y, drawW, drawH);
  }, [offset, zoom]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Pointer / Mouse events for dragging
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialOffsetX: offset.x,
      initialOffsetY: offset.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setOffset({
      x: dragStartRef.current.initialOffsetX + dx,
      y: dragStartRef.current.initialOffsetY + dy,
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Reset to default center
  const handleResetCenter = () => {
    if (!imgRef.current) return;
    const naturalWidth = imgRef.current.naturalWidth || imgRef.current.width;
    const naturalHeight = imgRef.current.naturalHeight || imgRef.current.height;
    const scale = Math.max(CANVAS_SIZE / naturalWidth, CANVAS_SIZE / naturalHeight);
    setZoom(1);
    setOffset({
      x: (CANVAS_SIZE - naturalWidth * scale) / 2,
      y: (CANVAS_SIZE - naturalHeight * scale) / 2,
    });
  };

  // Export cropped circle avatar
  const handleSaveCropped = async () => {
    const img = imgRef.current;
    if (!img) return;

    const outCanvas = document.createElement("canvas");
    outCanvas.width = OUTPUT_SIZE;
    outCanvas.height = OUTPUT_SIZE;
    const outCtx = outCanvas.getContext("2d");
    if (!outCtx) return;

    // High quality rendering
    outCtx.imageSmoothingEnabled = true;
    outCtx.imageSmoothingQuality = "high";

    const ratio = OUTPUT_SIZE / CANVAS_SIZE;
    const naturalWidth = img.naturalWidth || img.width;
    const naturalHeight = img.naturalHeight || img.height;

    const baseScale = Math.max(CANVAS_SIZE / naturalWidth, CANVAS_SIZE / naturalHeight);
    const currentScale = baseScale * zoom;

    const drawW = naturalWidth * currentScale * ratio;
    const drawH = naturalHeight * currentScale * ratio;
    const drawX = offset.x * ratio;
    const drawY = offset.y * ratio;

    outCtx.drawImage(img, drawX, drawY, drawW, drawH);

    outCanvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
        void onSave(file);
      },
      "image/jpeg",
      0.92
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="sikamitra-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) {
          onCancel();
        }
      }}
    >
      <div
        className="sikamitra-modal-card"
        style={{ maxWidth: "420px" }}
        role="dialog"
        aria-modal="true"
      >
        <div className="sikamitra-modal-header">
          <h3>Adjust Profile Picture</h3>
          <button
            type="button"
            className="sikamitra-modal-close"
            onClick={onCancel}
            disabled={saving}
          >
            <X size={18} />
          </button>
        </div>

        <div className="avatar-adjust-wrapper">
          <div
            className="avatar-adjust-canvas-box"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
            />
            {/* Circular cut-out guide */}
            <div className="avatar-adjust-overlay-circle" />
          </div>

          <p className="avatar-adjust-hint">
            Drag to position face in the circle. Use Auto-Adjust or zoom below.
          </p>

          <div className="avatar-adjust-controls">
            <div className="avatar-adjust-quick-actions">
              <button
                type="button"
                className="avatar-adjust-action-btn active"
                onClick={() => imgRef.current && performAutoAdjust(imgRef.current)}
                disabled={saving}
              >
                <Sparkles size={14} color="#6366f1" />
                Auto-Adjust Face
              </button>
              <button
                type="button"
                className="avatar-adjust-action-btn"
                onClick={handleResetCenter}
                disabled={saving}
              >
                <RotateCcw size={14} />
                Center
              </button>
            </div>

            <div className="avatar-adjust-slider-row">
              <ZoomIn size={16} />
              <span>Zoom</span>
              <input
                type="range"
                min="0.8"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                disabled={saving}
              />
              <span style={{ minWidth: "32px", textAlign: "right" }}>
                {Math.round(zoom * 100)}%
              </span>
            </div>
          </div>
        </div>

        <div className="sikamitra-modal-footer">
          <button
            type="button"
            className="sikamitra-btn-cancel"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="sikamitra-btn-primary"
            onClick={handleSaveCropped}
            disabled={saving}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Check size={16} />
            {saving ? "Saving..." : "Apply & Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarAdjustModal;
