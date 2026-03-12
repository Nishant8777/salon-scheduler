import React, { useState } from "react";
import {
  Booking, ServiceItem, GroupItem, PackageItem, PaymentMode, DiscountType,
} from "../../types";
import {
  CLIENT_LIST, CLIENT_STATS, REWARD_POINTS_OPTIONS, COUPON_CODES,
  STAFF_LIST, PACKAGES_LIST,
} from "../../data/mockData";
import { useSchedulerContext } from "../../context/SchedulerContext";
import { addMinutes } from "../../utils/timeUtils";
import MiniCalendar from "../shared/MiniCalendar";
import ServiceRow from "../booking/ServiceRow";
import GroupRow from "../booking/GroupRow";
import TotalsPanel from "../booking/TotalsPanel";

interface Props {
  onClose: () => void;
  defaultStaffId?: string;
  defaultTime?: string;
  existingBooking?: Booking;
}

type TempService = ServiceItem & { tempId: string };
type TempGroup   = GroupItem   & { tempId: string };
type TempPkg     = PackageItem & { tempId: string };

const NewAppointmentModal: React.FC<Props> = ({
  onClose, defaultStaffId, defaultTime, existingBooking,
}) => {
  const { addBooking, updateBooking, currentDate } = useSchedulerContext();
  const isEditMode = !!existingBooking;

  const [clientSearch,     setClientSearch]     = useState(existingBooking?.clientName || "");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(existingBooking?.clientId || null);
  const [isWalkin,         setIsWalkin]         = useState(!existingBooking?.clientId && !!existingBooking);
  const [showClientDrop,   setShowClientDrop]   = useState(false);
  const [calDate,          setCalDate]          = useState(existingBooking?.billDate || currentDate);
  const [showCal,          setShowCal]          = useState(false);
  const [showPkgModal,     setShowPkgModal]     = useState(false);

  // ── Walk-in form state ─────────────────────────────────────────────────────
  const [showWalkinForm, setShowWalkinForm] = useState(false);
  const [walkinName,     setWalkinName]     = useState("");
  const [walkinPhone,    setWalkinPhone]    = useState("");

  const [serviceRows, setServiceRows] = useState<TempService[]>(
    existingBooking?.services.map(s => ({ ...s, tempId: "sr_" + s.id })) || [{
      tempId: "sr_" + Date.now(), id: "", service: "", staff: "",
      staffId: defaultStaffId || "", time: defaultTime || "10:00",
      price: 0, qty: 0, total: 0,
    }]
  );
  const [groupRows,   setGroupRows]   = useState<TempGroup[]>(
    existingBooking?.groupItems?.map(g => ({ ...g, tempId: "gr_" + g.id })) || []
  );
  const [packageRows, setPackageRows] = useState<TempPkg[]>(
    existingBooking?.packageItems?.map(p => ({ ...p, tempId: "pk_" + p.id })) || []
  );

  const [rewardPoints,   setRewardPoints]   = useState(existingBooking?.rewardPoints   || "");
  const [exCharges,      setExCharges]      = useState(existingBooking?.exCharges      || 0);
  const [discount,       setDiscount]       = useState(existingBooking?.discount       || 0);
  const [discountType,   setDiscountType]   = useState<DiscountType>(existingBooking?.discountType || "Percentage (%)");
  const [gst,            setGst]            = useState(existingBooking?.gst            || 0);
  const [payMode,        setPayMode]        = useState<PaymentMode>(existingBooking?.paymentMode || "Cash");
  const [adjustPayment,  setAdjustPayment]  = useState(existingBooking?.payingNow      || 0);
  const [couponInput,    setCouponInput]    = useState(existingBooking?.couponCode      || "");
  const [couponDiscount, setCouponDiscount] = useState(existingBooking?.couponDiscount  || 0);
  const [couponApplied,  setCouponApplied]  = useState(existingBooking?.couponCode      || "");
  const [couponError,    setCouponError]    = useState("");
  const [notes,          setNotes]          = useState(existingBooking?.notes           || "");

  // ── Derived ───────────────────────────────────────────────────────────────
  const selectedClient  = CLIENT_LIST.find(c => c.id === selectedClientId);
  const selectedStats   = CLIENT_STATS.find(c => c.clientId === selectedClientId);

  const filteredClients = CLIENT_LIST.filter(c =>
    clientSearch.length >= 3 && (
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.phone.includes(clientSearch)
    )
  );

  const subtotal      = [...serviceRows, ...groupRows, ...packageRows].reduce((a, r) => a + (r.total || 0), 0);
  const discountVal   = discountType === "Percentage (%)" ? subtotal * discount / 100 : discount;
  const totalDiscount = discountVal + couponDiscount;
  const taxable       = Math.max(0, subtotal - totalDiscount);
  const grandTotal    = taxable + taxable * gst / 100 + exCharges;
  const dueAmount     = grandTotal - adjustPayment;

  // ── Handlers ─────────────────────────────────────────────────────────────
  function handleWalkinConfirm() {
    if (!walkinName.trim()) return;
    setIsWalkin(true);
    setClientSearch(walkinName.trim());
    setSelectedClientId(null);
    setShowWalkinForm(false);
    setShowClientDrop(false);
  }

  function handleApplyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (COUPON_CODES[code] !== undefined) {
      setCouponDiscount(COUPON_CODES[code]);
      setCouponApplied(code);
      setCouponError("");
    } else {
      setCouponDiscount(0); setCouponApplied(""); setCouponError("Invalid coupon code");
    }
  }

  function updateServiceRow(id: string, field: string, value: string | number | boolean) {
    setServiceRows(rows => rows.map(r => r.tempId !== id ? r : { ...r, [field]: value }));
  }
  function removeServiceRow(id: string) { setServiceRows(rows => rows.filter(r => r.tempId !== id)); }
  function updateGroupRow(id: string, field: string, value: string | number) {
    setGroupRows(rows => rows.map(r => r.tempId !== id ? r : { ...r, [field]: value }));
  }
  function removeGroupRow(id: string) { setGroupRows(rows => rows.filter(r => r.tempId !== id)); }

  function addPackage(pkg: typeof PACKAGES_LIST[0]) {
    setPackageRows(r => [...r, {
      tempId: "pk_" + Date.now(), id: "",
      packageId: pkg.id, packageName: pkg.name,
      price: pkg.price, qty: 1, total: pkg.price,
    }]);
    setShowPkgModal(false);
  }

  function handleSave() {
  const clientName  = isWalkin
    ? (walkinName || clientSearch || "Walk-In")
    : (selectedClient?.name || clientSearch || "Walk-In");
  const clientPhone = isWalkin
    ? walkinPhone
    : (selectedClient?.phone || existingBooking?.clientPhone || "");

  // Group services by staffId
  const staffServiceMap: Record<string, TempService[]> = {};
  serviceRows.forEach(r => {
    const sid = r.staffId || defaultStaffId || existingBooking?.staffId || STAFF_LIST[0].id;
    if (!staffServiceMap[sid]) staffServiceMap[sid] = [];
    staffServiceMap[sid].push(r);
  });

  const staffIds = Object.keys(staffServiceMap);

  // If editing — just update as single booking (no split)
  if (isEditMode) {
    const firstRow  = serviceRows[0];
    const startTime = firstRow?.time || existingBooking?.startTime || "10:00";
    const endTime   = addMinutes(startTime, 30);
    updateBooking({
      ...existingBooking!,
      clientId: selectedClientId || undefined,
      clientName, clientPhone,
      startTime, endTime,
      staffId: firstRow?.staffId || existingBooking?.staffId || STAFF_LIST[0].id,
      billDate: calDate,
      services: serviceRows.map(r => ({
        id: r.id || "s_" + r.tempId, service: r.service,
        staff: STAFF_LIST.find(s => s.id === r.staffId)?.name || r.staff || "",
        staffId: r.staffId, time: r.time,
        price: r.price, qty: r.qty || 1, total: r.total,
      })),
      groupItems: groupRows.map(r => ({
        id: r.id || "g_" + r.tempId, guestName: r.guestName,
        service: r.service, staffId: r.staffId,
        time: r.time, price: r.price, qty: r.qty || 1, total: r.total,
      })),
      packageItems: packageRows.map(r => ({
        id: r.id || "pk_" + r.tempId, packageId: r.packageId,
        packageName: r.packageName, price: r.price, qty: r.qty, total: r.total,
      })),
      paymentMode: payMode, rewardPoints, exCharges,
      discount, discountType, gst,
      couponCode: couponApplied, couponDiscount,
      subtotal, taxableAmount: taxable, grandTotal,
      payingNow: adjustPayment, dueAmount, notes,
      paymentStatus: adjustPayment >= grandTotal ? "Paid" : adjustPayment > 0 ? "Partial" : "Unpaid",
    });
    onClose();
    return;
  }

  // New booking — create one booking per staff
  staffIds.forEach((staffId, index) => {
    const staffServices = staffServiceMap[staffId];
    const firstRow      = staffServices[0];
    const startTime     = firstRow?.time || defaultTime || "10:00";
    const endTime       = addMinutes(startTime, 30);

    // Only first staff booking gets full payment, rest get 0
    const staffSubtotal = staffServices.reduce((a, r) => a + (r.total || 0), 0);

    const bookingData: Booking = {
      id:          "b_" + Date.now() + "_" + index,
      clientId:    selectedClientId || undefined,
      clientName,  clientPhone,
      staffId,
      date:        currentDate,
      billDate:    calDate,
      startTime,   endTime,
      services: staffServices.map(r => ({
        id: "s_" + r.tempId, service: r.service,
        staff: STAFF_LIST.find(s => s.id === r.staffId)?.name || r.staff || "",
        staffId: r.staffId, time: r.time,
        price: r.price, qty: r.qty || 1, total: r.total,
      })),
      groupItems:   [],
      packageItems: index === 0 ? packageRows.map(r => ({
        id: "pk_" + r.tempId, packageId: r.packageId,
        packageName: r.packageName, price: r.price, qty: r.qty, total: r.total,
      })) : [],
      status:        "Confirmed",
      paymentStatus: index === 0
        ? (adjustPayment >= grandTotal ? "Paid" : adjustPayment > 0 ? "Partial" : "Unpaid")
        : "Unpaid",
      paymentMode:   payMode,
      rewardPoints:  index === 0 ? rewardPoints : "",
      exCharges:     index === 0 ? exCharges : 0,
      discount:      index === 0 ? discount : 0,
      discountType,
      gst:           index === 0 ? gst : 0,
      couponCode:    index === 0 ? couponApplied : "",
      couponDiscount: index === 0 ? couponDiscount : 0,
      subtotal:      staffSubtotal,
      taxableAmount: staffSubtotal,
      grandTotal:    staffSubtotal,
      payingNow:     index === 0 ? adjustPayment : 0,
      dueAmount:     staffSubtotal,
      notes,
    };

    addBooking(bookingData);
  });

  onClose();
}

  // ── Stats panel row helper ────────────────────────────────────────────────
  const InfoCell = ({
    label, value, red, blue, link,
  }: { label: string; value: string | number; red?: boolean; blue?: boolean; link?: boolean }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{
        fontSize: 11, color: red ? "#ef4444" : "#9ca3af",
        fontWeight: 600, textTransform: "uppercase", letterSpacing: ".3px",
      }}>{label}</span>
      <span style={{
        fontSize: 13, fontWeight: 700,
        color: red ? "#ef4444" : blue || link ? "#3b82f6" : "#1f2937",
        textDecoration: link ? "underline" : "none",
        cursor: link ? "pointer" : "default",
      }}>{value}</span>
    </div>
  );

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 1000, display: "flex", justifyContent: "flex-end" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ width: "min(700px,100vw)", background: "#fff", height: "100vh", overflowY: "auto", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ padding: "18px 24px 14px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, background: "#fff", zIndex: 5 }}>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20 }}>✕</button>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
            {isEditMode ? "✏️ Edit Appointment" : "New Appointment"}
          </h2>
          {isEditMode && (
            <span style={{ fontSize: 12, background: "#eff6ff", color: "#3b82f6", borderRadius: 4, padding: "2px 8px", fontWeight: 600 }}>
              Editing #{existingBooking.id}
            </span>
          )}
        </div>

        <div style={{ padding: "18px 24px", flex: 1 }}>

          {/* ── Client search row ── */}
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", position: "relative" }}>
            <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
              <input
                className="form-input"
                placeholder="Search By Name / Contact (min 3 chars)"
                value={clientSearch}
                onChange={e => {
                  setClientSearch(e.target.value);
                  setShowClientDrop(true);
                  setIsWalkin(false);
                  setSelectedClientId(null);
                  setWalkinName(""); setWalkinPhone("");
                }}
                onFocus={() => clientSearch.length >= 3 && setShowClientDrop(true)}
              />
              {showClientDrop && filteredClients.length > 0 && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,.1)", marginTop: 2, overflow: "hidden" }}>
                  {filteredClients.map(c => (
                    <div key={c.id}
                      onClick={() => {
                        setSelectedClientId(c.id);
                        setClientSearch(c.name);
                        setShowClientDrop(false);
                        setIsWalkin(false);
                        setWalkinName(""); setWalkinPhone("");
                      }}
                      style={{ padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid #f3f4f6", fontSize: 13 }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#f9fafb")}
                      onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
                    >
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                      <div style={{ color: "#6b7280", fontSize: 12 }}>{c.phone}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Walk-in button */}
<button
  onClick={() => { setShowWalkinForm(true); setSelectedClientId(null); }}
  style={{
    background: isWalkin ? "#22c55e" : "#1f2937",
    color: "#fff", border: "none", borderRadius: 6,
    padding: "7px 14px", fontSize: 13, fontWeight: 600,
    cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit",
  }}
>
  {isWalkin ? `✓ ${walkinName || "Walk-In"}` : "Walkin Client"}
</button>

{/* Add Client button — not wired yet */}
<button
  disabled
  style={{
    background: "#1f2937", color: "#fff",
    border: "none", borderRadius: 6,
    padding: "7px 14px", fontSize: 13, fontWeight: 600,
    cursor: "not-allowed", whiteSpace: "nowrap",
    fontFamily: "inherit",
  }}
>
  + Add Client
</button>

            {/* Bill date */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
              <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>Bill Date</span>
              <div style={{ position: "relative" }}>
                <input readOnly value={calDate} onClick={() => setShowCal(v => !v)}
                  className="form-input" style={{ cursor: "pointer", width: 110 }} />
                {showCal && <MiniCalendar value={calDate} onChange={d => { setCalDate(d); setShowCal(false); }} onClose={() => setShowCal(false)} />}
              </div>
            </div>
          </div>

          {/* ── Walk-in form popup ── */}
          {showWalkinForm && (
            <div style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,.4)", zIndex: 3000,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
              onClick={() => setShowWalkinForm(false)}
            >
              <div
                style={{
                  background: "#fff", borderRadius: 12, padding: 28,
                  width: "min(380px,90vw)",
                  boxShadow: "0 8px 32px rgba(0,0,0,.2)",
                }}
                onClick={e => e.stopPropagation()}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>🚶 Walk-In Client</h3>
                  <button onClick={() => setShowWalkinForm(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#6b7280" }}>✕</button>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>
                    Client Name <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    autoFocus
                    className="form-input"
                    placeholder="Enter name"
                    value={walkinName}
                    onChange={e => setWalkinName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleWalkinConfirm()}
                  />
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>
                    Phone Number <span style={{ color: "#9ca3af", fontSize: 11 }}>(optional)</span>
                  </label>
                  <input
                    className="form-input"
                    placeholder="Enter phone"
                    value={walkinPhone}
                    onChange={e => setWalkinPhone(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleWalkinConfirm()}
                  />
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => setShowWalkinForm(false)}
                    style={{ flex: 1, padding: "10px 0", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                  >Cancel</button>
                  <button
                    onClick={handleWalkinConfirm}
                    disabled={!walkinName.trim()}
                    style={{
                      flex: 1, padding: "10px 0", border: "none", borderRadius: 8,
                      background: walkinName.trim() ? "#1f2937" : "#d1d5db",
                      color: "#fff", fontSize: 13, fontWeight: 600,
                      cursor: walkinName.trim() ? "pointer" : "not-allowed",
                      fontFamily: "inherit",
                    }}
                  >Confirm</button>
                </div>
              </div>
            </div>
          )}

          {/* ── Existing client stats panel ── */}
          {selectedClientId && selectedStats && (
            <div style={{
              background: "#f9fafb", border: "1px solid #e5e7eb",
              borderRadius: 10, padding: "16px 20px", marginBottom: 16,
            }}>
              {/* Client name + phone header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid #e5e7eb" }}>
                <div style={{
                  width: 42, height: 42, borderRadius: "50%",
                  background: "#1f2937", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: 16, flexShrink: 0,
                }}>
                  {selectedClient!.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{selectedClient!.name}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{selectedClient!.phone} &nbsp;·&nbsp; {selectedStats.address}</div>
                </div>
                {selectedStats.membership !== "NA" && (
                  <span style={{
                    marginLeft: "auto", fontSize: 11, fontWeight: 700,
                    background: selectedStats.membership === "Platinum" ? "#fef3c7" : selectedStats.membership === "Gold" ? "#fde68a" : "#e0f2fe",
                    color: selectedStats.membership === "Platinum" ? "#92400e" : selectedStats.membership === "Gold" ? "#78350f" : "#0369a1",
                    borderRadius: 6, padding: "3px 10px",
                  }}>
                    ⭐ {selectedStats.membership}
                  </span>
                )}
              </div>

              {/* Stats grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px 20px", marginBottom: 14 }}>
                <InfoCell label="Reward Points"    value={selectedStats.rewardPoints} />
                <InfoCell label="Ewallet Amt"      value={`₹${selectedStats.ewalletAmt}`} />
                <InfoCell label="Unpaid Amt"       value={`₹${selectedStats.unpaidAmt}`} red={selectedStats.unpaidAmt > 0} />
                <InfoCell label="Assign Discount"  value={`${selectedStats.assignDiscount}%`} />
                <InfoCell label="Disc. Validity"   value={selectedStats.discountValidity} />
                <InfoCell label="Membership"       value={selectedStats.membership} />
                <InfoCell label="No Show"          value={selectedStats.noShow} red={selectedStats.noShow > 0} />
                <InfoCell label="Cancelled"        value={selectedStats.cancelled} red={selectedStats.cancelled > 0} />
                <InfoCell label="Total Visits"     value={selectedStats.totalVisit} />
                <InfoCell label="Last Visit"       value={selectedStats.lastVisit} />
                <InfoCell label="Total Revenue"    value={`₹${selectedStats.totalRevenue.toLocaleString()}`} blue />
                <InfoCell label="View History"     value="Click Here" link />
              </div>

              {/* Notes + Staff alert */}
              {(selectedStats.notes || selectedStats.staffAlert) && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, paddingTop: 12, borderTop: "1px solid #e5e7eb" }}>
                  {selectedStats.notes && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", marginBottom: 4 }}>📝 Notes</div>
                      <div style={{ fontSize: 12, color: "#374151" }}>{selectedStats.notes}</div>
                    </div>
                  )}
                  {selectedStats.staffAlert && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", textTransform: "uppercase", marginBottom: 4 }}>🔔 Staff Alert</div>
                      <div style={{ fontSize: 12, color: "#ef4444", fontWeight: 600 }}>{selectedStats.staffAlert}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Services header */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1.4fr 1.2fr 0.8fr 0.7fr 0.8fr 32px", gap: 6, background: "#f9fafb", borderRadius: "8px 8px 0 0", padding: "8px 10px", fontSize: 12, fontWeight: 600, color: "#6b7280" }}>
            <div>Services</div><div>Staff</div><div>Time</div><div>Price</div><div>Qty</div><div>Total</div><div></div>
          </div>
          {serviceRows.map(row => (
            <ServiceRow key={row.tempId} row={row} onChange={updateServiceRow} onRemove={removeServiceRow} />
          ))}

          {/* Group rows */}
          {groupRows.length > 0 && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1.4fr 1.2fr 0.8fr 0.7fr 0.8fr 32px", gap: 6, background: "#f9fafb", padding: "8px 10px", fontSize: 12, fontWeight: 600, color: "#6b7280", borderTop: "1px solid #e5e7eb" }}>
                <div>Guest</div><div>Service</div><div>Staff</div><div>Time</div><div>Price</div><div>Qty</div><div>Total</div><div></div>
              </div>
              {groupRows.map(row => (
                <GroupRow key={row.tempId} row={row} onChange={updateGroupRow} onRemove={removeGroupRow} />
              ))}
            </>
          )}

          {/* Package rows */}
          {packageRows.length > 0 && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 32px", gap: 6, background: "#fef3c7", padding: "8px 10px", fontSize: 12, fontWeight: 600, color: "#92400e", borderTop: "1px solid #e5e7eb" }}>
                <div>Package</div><div>Price</div><div>Qty</div><div>Total</div><div></div>
              </div>
              {packageRows.map(row => (
                <div key={row.tempId} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 32px", gap: 6, padding: "8px 10px", background: "#fffbeb", borderTop: "1px solid #e5e7eb", alignItems: "center" }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{row.packageName}</div>
                  <input readOnly value={row.price} className="form-input" style={{ fontSize: 12, background: "#f9fafb" }} />
                  <input type="number" value={row.qty} className="form-input" style={{ fontSize: 12 }}
                    onChange={e => {
                      const qty = Math.max(1, parseInt(e.target.value) || 1);
                      setPackageRows(rows => rows.map(r => r.tempId === row.tempId ? { ...r, qty, total: r.price * qty } : r));
                    }} />
                  <input readOnly value={row.total} className="form-input" style={{ fontSize: 12, background: "#f9fafb" }} />
                  <button style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 16 }} onClick={() => setPackageRows(r => r.filter(x => x.tempId !== row.tempId))}>🗑</button>
                </div>
              ))}
            </>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 10, marginBottom: 20, flexWrap: "wrap" }}>
            {[
              { label: "Add Services", onClick: () => setServiceRows(r => [...r, { tempId: "sr_" + Date.now(), id: "", service: "", staff: "", staffId: "", time: "10:00", price: 0, qty: 0, total: 0 }]) },
              { label: "Add To Group", onClick: () => setGroupRows(r => [...r, { tempId: "gr_" + Date.now(), id: "", guestName: "", service: "", staffId: "", time: "10:00", price: 0, qty: 0, total: 0 }]) },
              { label: "Add Package",  onClick: () => setShowPkgModal(true) },
            ].map(({ label, onClick }) => (
              <button key={label} onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 6, background: "#1f2937", color: "#fff", border: "none", borderRadius: 6, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                {label} <span style={{ fontSize: 16 }}>+</span>
              </button>
            ))}
          </div>

          {/* Extras row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, marginBottom: 16 }}>
            <div>
              <label className="label">Reward Points</label>
              <select className="form-select" value={rewardPoints} onChange={e => setRewardPoints(e.target.value)}>
                {REWARD_POINTS_OPTIONS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Ex Charges</label>
              <input type="number" className="form-input" value={exCharges || ""} onChange={e => setExCharges(parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <label className="label">Discount</label>
              <input type="number" className="form-input" value={discount || ""} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <label className="label">Discount Type</label>
              <select className="form-select" value={discountType} onChange={e => setDiscountType(e.target.value as DiscountType)}>
                <option>Percentage (%)</option><option>Flat (₹)</option>
              </select>
            </div>
            <div>
              <label className="label">GST %</label>
              <input type="number" className="form-input" value={gst || ""} onChange={e => setGst(parseFloat(e.target.value) || 0)} />
            </div>
          </div>

          {/* Payment + Totals */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
                {(["Cash", "Card", "UPI"] as PaymentMode[]).map(m => (
                  <label key={m} style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer", fontSize: 13 }}>
                    <input type="radio" name="paymode" checked={payMode === m} onChange={() => setPayMode(m)} /> {m}
                  </label>
                ))}
              </div>
              <div style={{ marginBottom: 10 }}>
                <label className="label">Adjust Payment</label>
                <input type="number" className="form-input" value={adjustPayment || ""} onChange={e => setAdjustPayment(parseFloat(e.target.value) || 0)} />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label className="label">Coupon Code</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="form-input" style={{ flex: 1 }} placeholder="SAVE10, FLAT50, NEW20"
                    value={couponInput} onChange={e => { setCouponInput(e.target.value); setCouponError(""); }}
                    onKeyDown={e => e.key === "Enter" && handleApplyCoupon()} />
                  <button className="btn-primary" onClick={handleApplyCoupon}>Apply</button>
                </div>
                {couponApplied && <div style={{ fontSize: 12, color: "#22c55e", marginTop: 4 }}>✓ "{couponApplied}" applied — ₹{couponDiscount} off</div>}
                {couponError   && <div style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>{couponError}</div>}
              </div>
              <textarea className="form-textarea" placeholder="Enter Notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
            </div>

            <TotalsPanel
              subtotal={subtotal} exCharges={exCharges}
              discount={discount} discountType={discountType}
              gst={gst} adjustPayment={adjustPayment}
              couponDiscount={couponDiscount}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 24px", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", bottom: 0, background: "#fff" }}>
          <button onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid #d1d5db", borderRadius: 6, padding: "8px 16px", fontSize: 13, cursor: "pointer", background: "#fff", fontFamily: "inherit" }}>
            🖨 Print
          </button>
          <button className="btn-primary" style={{ padding: "10px 32px" }} onClick={handleSave}>
            {isEditMode ? "Update Appointment" : "Save"}
          </button>
        </div>
      </div>

      {/* Package picker */}
      {showPkgModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowPkgModal(false)}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, width: "min(480px,90vw)", boxShadow: "0 8px 32px rgba(0,0,0,.2)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Select Package</h3>
              <button onClick={() => setShowPkgModal(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20 }}>✕</button>
            </div>
            {PACKAGES_LIST.map(pkg => (
              <div key={pkg.id} onClick={() => addPackage(pkg)}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", border: "1px solid #e5e7eb", borderRadius: 8, marginBottom: 8, cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f9fafb")}
                onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{pkg.name}</div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{pkg.services.join(", ")}</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>₹{pkg.price}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewAppointmentModal;