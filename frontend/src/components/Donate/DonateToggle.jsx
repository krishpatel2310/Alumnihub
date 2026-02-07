export default function DonateToggle({ mode, setMode }) {
  return (
    <div className="donate-toggle">
      <button
        className={mode === "anonymous" ? "active" : ""}
        onClick={() => setMode("anonymous")}
      >
        Anonymous
      </button>
      <button
        className={mode === "named" ? "active" : ""}
        onClick={() => setMode("named")}
      >
        With Name
      </button>
    </div>
  );
}
