import styles from "./Button.scss";

function Button({ func, deckId, children, className, disabled = false }) {
  return (
    <button
      disabled={disabled}
      className={`${className}`}
      onClick={() => {
        deckId ? func(deckId) : func();
      }}
    >
      {children}
    </button>
  );
}

export default Button;
