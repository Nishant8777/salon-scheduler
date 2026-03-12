import React from "react";
import { ServiceItem } from "../../types";
import { STAFF_LIST, SERVICES_LIST } from "../../data/mockData";
import { useSchedulerContext } from "../../context/SchedulerContext";
import TimeSelect from "../shared/TimeSelect";

interface ServiceRowProps {
  row: ServiceItem & { tempId: string };
  onChange: (id: string, field: string, value: string | number | boolean) => void;
  onRemove: (id: string) => void;
}

const ServiceRow: React.FC<ServiceRowProps> = ({ row, onChange, onRemove }) => {
  const { interval } = useSchedulerContext();

  function handleNumericChange(field: string, val: string) {
    const num = parseFloat(val) || 0;
    onChange(row.tempId, field, num);
    if (field === "price" || field === "qty") {
      const price = field === "price" ? num : (parseFloat(String(row.price)) || 0);
      const qty   = field === "qty"   ? num : (parseFloat(String(row.qty))   || 0);
      onChange(row.tempId, "total", price * qty);
    }
  }

  return (
    <div className="appt-modal__service-row">
      {/* Service */}
      <select
        value={row.service}
        onChange={e => onChange(row.tempId, "service", e.target.value)}
        className="form-select"
        style={{ fontSize: 12 }}
      >
        <option value="">Select Service</option>
        {SERVICES_LIST.map(s => <option key={s}>{s}</option>)}
      </select>

      {/* Staff pill */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <div className="staff-pill">
          <span>×</span>
          <select
            value={row.staffId}
            onChange={e => onChange(row.tempId, "staffId", e.target.value)}
          >
            <option value="">Staff</option>
            {STAFF_LIST.map(s => (
              <option key={s.id} value={s.id} style={{ color: "#000" }}>{s.name}</option>
            ))}
          </select>
        </div>
        <button
          className="btn-icon"
          style={{ color: row.isFav ? "#ef4444" : undefined }}
          onClick={() => onChange(row.tempId, "isFav", !row.isFav)}
        >♥</button>
      </div>

      {/* Time */}
      <TimeSelect
        value={row.time}
        onChange={val => onChange(row.tempId, "time", val)}
        interval={interval}
        className="form-select"
      />

      {/* Price */}
      <input
        type="number" placeholder="0" value={row.price || ""}
        onChange={e => handleNumericChange("price", e.target.value)}
        className="form-input" style={{ fontSize: 12 }}
      />

      {/* Qty */}
      <input
        type="number" placeholder="0" value={row.qty || ""}
        onChange={e => handleNumericChange("qty", e.target.value)}
        className="form-input" style={{ fontSize: 12 }}
      />

      {/* Total */}
      <input
        readOnly value={row.total ? row.total.toFixed(2) : "0"}
        className="form-input" style={{ fontSize: 12, background: "#f3f4f6" }}
      />

      {/* Delete */}
      <button className="btn-icon btn-icon--danger" onClick={() => onRemove(row.tempId)}>🗑</button>
    </div>
  );
};

export default ServiceRow;