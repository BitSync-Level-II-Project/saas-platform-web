import { useEffect, useRef } from "react";
import "./UnsavedChangesDialog.css";

type UnsavedChangesDialogProps = {
  onStay: () => void;
  onDiscard: () => void;
  onSave: () => void;
};

export function UnsavedChangesDialog({
  onStay,
  onDiscard,
  onSave,
}: UnsavedChangesDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stayButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    dialog.showModal();
    stayButtonRef.current?.focus();

    return () => {
      dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="template-unsaved-dialog"
      aria-labelledby="template-unsaved-title"
      aria-describedby="template-unsaved-description"
      onCancel={(event) => {
        event.preventDefault();
        onStay();
      }}
    >
      <h2 id="template-unsaved-title">Save your changes?</h2>
      <p id="template-unsaved-description">
        You have unsaved changes to this template. Save a draft before leaving,
        or discard only the changes made since you opened it.
      </p>

      <div className="template-unsaved-dialog__actions">
        <button ref={stayButtonRef} type="button" onClick={onStay}>
          Stay
        </button>
        <button
          type="button"
          className="template-unsaved-dialog__discard"
          onClick={onDiscard}
        >
          Discard
        </button>
        <button
          type="button"
          className="template-unsaved-dialog__save"
          onClick={onSave}
        >
          Save draft
        </button>
      </div>
    </dialog>
  );
}
