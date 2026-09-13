import React, { useEffect } from "react";
import { AlertTriangle, Trash2, HelpCircle } from "lucide-react";

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText = "Cancel",
  type = "danger",
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const defaultConfirmText = type === "danger" ? "Delete" : "Confirm";

  return (
    <div
      className="sikamitra-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onCancel();
        }
      }}
    >
      <div
        className="sikamitra-modal-card"
        style={{ maxWidth: "440px" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <div className="sikamitra-confirm-body">
          <div className={`sikamitra-confirm-icon-wrap ${type}`}>
            {type === "danger" ? (
              <Trash2 size={22} />
            ) : type === "warning" ? (
              <AlertTriangle size={22} />
            ) : (
              <HelpCircle size={22} />
            )}
          </div>
          <div className="sikamitra-confirm-content" style={{ flex: 1 }}>
            <h3 id="confirm-dialog-title">{title}</h3>
            <p>{message}</p>
          </div>
        </div>

        <div className="sikamitra-modal-footer">
          <button
            type="button"
            className="sikamitra-btn-cancel"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={type === "danger" ? "sikamitra-btn-danger" : "sikamitra-btn-primary"}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Please wait..." : (confirmText || defaultConfirmText)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
