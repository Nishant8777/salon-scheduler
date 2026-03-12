import React from "react";
import { Booking } from "../../types";
import { useScheduler } from "../../hooks/useScheduler";
import { useBookings } from "../../hooks/useBookings";
import { getWeekDays, formatTime12 } from "../../utils/timeUtils";

interface ListWeekViewProps {
  onViewBill: (booking: Booking) => void;
}

const ListWeekView: React.FC<ListWeekViewProps> = ({ onViewBill }) => {
  const { currentDate } = useScheduler();
  const { getBookingsByDate } = useBookings();
  const today    = new Date().toISOString().slice(0, 10);
  const weekDays = getWeekDays(currentDate);

  return (
    <div className="list-view">
      {weekDays.map(day => {
        const dayBk = getBookingsByDate(day);
        const label = new Date(day + "T00:00:00").toLocaleDateString("en-US", {
          weekday: "long", month: "long", day: "numeric",
        });
        return (
          <div key={day} style={{ marginBottom: 20 }}>
            <div className={`list-view__day-header ${day === today ? "list-view__day-header--today" : ""}`}>
              {label}
            </div>
            {dayBk.length === 0 ? (
              <div style={{ fontSize: 12, color: "#9ca3af", fontStyle: "italic" }}>No appointments</div>
            ) : dayBk.map(b => (
              <div key={b.id} className="list-view__item" onClick={() => onViewBill(b)}>
                <div className="list-view__bar" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{b.services[0]?.service}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    {b.clientName} · {formatTime12(b.startTime)}
                  </div>
                </div>
                <span className={`list-view__badge list-view__badge--${b.paymentStatus.toLowerCase()}`}>
                  {b.paymentStatus}
                </span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default ListWeekView;