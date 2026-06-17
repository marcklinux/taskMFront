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
          Calendario
        </button>
      </div>
    </div>
  );
};

export default CalendarField;
