import { useEffect, useRef } from "react";

type Props = {
  name: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmPublishDialog({ name, onCancel, onConfirm }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    dialog.showModal();
    return () => dialog.close();
  }, []);

  return (
    <dialog
      ref={ref}
      className="tm-confirm"
      aria-labelledby="publish-confirm-title"
      aria-describedby="publish-confirm-description"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <span className="tm-eyebrow">Publish template</span>

      <h2 id="publish-confirm-title">Publish “{name.trim()}”?</h2>

      <p id="publish-confirm-description">
        A published version will be created. This template will become
        read-only.
      </p>

      <div className="tm-dialog-actions">
        <button className="tm-button" type="button" onClick={onCancel}>
          Keep editing
        </button>

        <button
          className="tm-button tm-button--primary"
          type="button"
          onClick={onConfirm}
        >
          Publish template
        </button>
      </div>
    </dialog>
  );
}
