import { useRef } from 'react';

const CalendarField = ({ id, label, value, onChange, min, max }) => {
  const inputRef = useRef(null);

  const handleOpenPicker = () => {
    if (!inputRef.current) {
      return;
    }

    if (typeof inputRef.current.showPicker === 'function') {
      inputRef.current.showPicker();
      return;
    }

    inputRef.current.focus();
  };

  return (
    <div className="weekly-range-field calendar-picker-field">
      <label htmlFor={id}>{label}</label>
      <div className="calendar-picker-control">
        <input
          ref={inputRef}
          id={id}
          type="date"
          value={value}
          min={min}
          max={max}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          className="calendar-picker-button"
          onClick={handleOpenPicker}
          aria-label={`Abrir calendario para ${label.toLowerCase()}`}
        >
          <svg
            className="calendar-picker-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M7 2v2H5a2 2 0 0 0-2 2v13a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7zm12 8H5v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9zM6 6h12a1 1 0 0 1 1 1v1H5V7a1 1 0 0 1 1-1z"
              fill="currentColor"
            />
          </svg>
          <span>Abrir</span>
        </button>
      </div>
    </div>
  );
};

export default CalendarField;
