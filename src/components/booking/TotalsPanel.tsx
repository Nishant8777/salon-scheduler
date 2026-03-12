import React from "react";

interface TotalsPanelProps {
  subtotal: number;
  exCharges: number;
  discount: number;
  discountType: string;
  gst: number;
  adjustPayment: number;
  couponDiscount?: number;
}

const TotalsPanel: React.FC<TotalsPanelProps> = ({
  subtotal, exCharges, discount, discountType, gst, adjustPayment, couponDiscount = 0,
}) => {
  const discountVal   = discountType === "Percentage (%)" ? subtotal * discount / 100 : discount;
  const totalDiscount = discountVal + couponDiscount;
  const taxable       = Math.max(0, subtotal - totalDiscount);
  const gstVal        = taxable * gst / 100;
  const grandTotal    = taxable + gstVal + exCharges;
  const due           = grandTotal - adjustPayment;

  type Row = { label: string; value: string; bold?: boolean; muted?: boolean; colored?: string };

  const rows: Row[] = [
    { label: "Subtotal (₹):",       value: subtotal.toFixed(2) },
    ...(totalDiscount > 0 ? [{ label: "Discount (₹):", value: `-${totalDiscount.toFixed(2)}`, colored: "#22c55e" }] : []),
    ...(gst > 0           ? [{ label: `GST ${gst}% (₹):`, value: gstVal.toFixed(2), colored: "#f59e0b" }] : []),
    ...(exCharges > 0     ? [{ label: "Ex Charges (₹):", value: exCharges.toFixed(2) }] : []),
    { label: "Tip Amount (₹):",     value: "0.00" },
    { label: "Grand Total (₹):",    value: grandTotal.toFixed(2), bold: true },
    { label: "Taxable Amount (₹):", value: taxable.toFixed(2) },
    { label: "Paying Now (₹):",     value: adjustPayment.toFixed(2), muted: true },
    { label: "Due Amount (₹):",     value: due.toFixed(2), muted: true },
  ];

  return (
    <div style={{
      flex: 1, background: "#f9fafb", borderRadius: 8,
      padding: "12px 16px", fontSize: 13,
    }}>
      {rows.map(({ label, value, bold, muted, colored }) => (
        <div key={label} style={{
          display: "flex", justifyContent: "space-between",
          padding: "5px 0", borderBottom: "1px solid #e5e7eb",
        }}>
          <span style={{ color: "#6b7280" }}>{label}</span>
          <span style={{
            fontWeight: bold ? 700 : 400,
            color: colored || (muted ? "#9ca3af" : "#111827"),
          }}>
            {value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default TotalsPanel;