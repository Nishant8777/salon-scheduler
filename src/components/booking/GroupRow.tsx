import React from "react";
import { GroupItem } from "../../types";
import { STAFF_LIST, SERVICES_LIST } from "../../data/mockData";
import { useSchedulerContext } from "../../context/SchedulerContext";
import TimeSelect from "../shared/TimeSelect";

interface GroupRowProps {
  row: GroupItem & { tempId: string };
  onChange: (id: string, field: string, value: string | number) => void;
  onRemove: (id: string) => void;
}

const GroupRow: React.FC<GroupRowProps> = ({ row, onChange, onRemove }) => {
  const { interval } = useSchedulerContext();

  function handleNumericChange(field: string, val: string) {
    const num = parseFloat(val) || 0;
    onChange(row.tempId, field, num);
    if (field === "price" || field === "qty") {
      const price = field === "price" ? num : row.price;
      const qty   = field === "qty"   ? num : row.qty;
      onChange(row.tempId, "total", price * qty);
    }
  }

  return (
    <div className="appt-modal__group-row">
      <input
        placeholder="Add Guest Name" value={row.guestName}
        onChange={e => onChange(row.tempId, "guestName", e.target.value)}
        className="form-input" style={{ fontSize: 12 }}
      />
      <select
        value={row.service} onChange={e => onChange(row.tempId, "service", e.target.value)}
        className="form-select" style={{ fontSize: 12 }}
      >
        <option value="">Select Service</option>
        {SERVICES_LIST.map(s => <option key={s}>{s}</option>)}
      </select>
      <select
        value={row.staffId} onChange={e => onChange(row.tempId, "staffId", e.target.value)}
        className="form-select" style={{ fontSize: 12 }}
      >
        <option value="">Select Staff</option>
        {STAFF_LIST.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      <TimeSelect
        value={row.time} onChange={val => onChange(row.tempId, "time", val)}
        interval={interval} className="form-select"
      />
      <input
        type="number" placeholder="0" value={row.price || ""}
        onChange={e => handleNumericChange("price", e.target.value)}
        className="form-input" style={{ fontSize: 12 }}
      />
      <input
        type="number" placeholder="0" value={row.qty || ""}
        onChange={e => handleNumericChange("qty", e.target.value)}
        className="form-input" style={{ fontSize: 12 }}
      />
      <input
        readOnly value={row.total ? row.total.toFixed(2) : "0"}
        className="form-input" style={{ fontSize: 12, background: "#f3f4f6" }}
      />
      <button className="btn-icon btn-icon--danger" onClick={() => onRemove(row.tempId)}>🗑</button>
    </div>
  );
};

export default GroupRow;