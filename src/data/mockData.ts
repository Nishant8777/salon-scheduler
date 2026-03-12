import { Staff, Client, Booking, BlockedTime } from "../types";

export const STAFF_LIST: Staff[] = [
  { id: "1", name: "MICHEL",    initials: "MI", color: "#4f46e5" },
  { id: "2", name: "STEVE",     initials: "ST", color: "#0891b2" },
  { id: "3", name: "PRITI",     initials: "PR", color: "#be185d" },
  { id: "4", name: "SWAPNALI",  initials: "SW", color: "#059669" },
  { id: "5", name: "NIKITA J.", initials: "NJ", color: "#d97706" },
  { id: "6", name: "NIKITA K.", initials: "NK", color: "#7c3aed" },
];

export interface ClientStats {
  clientId: string;
  address: string;
  rewardPoints: number;
  ewalletAmt: number;
  unpaidAmt: number;
  membership: string;
  assignDiscount: number;
  discountValidity: string;
  noShow: number;
  cancelled: number;
  totalVisit: number;
  lastVisit: string;
  totalRevenue: number;
  notes: string;
  staffAlert: string;
}

export const CLIENT_LIST: Client[] = [
  { id: "1", name: "Mayuri Jadhav",  phone: "9834300856", eWallet: 0 },
  { id: "2", name: "Shivani Dhumal", phone: "9812345678", eWallet: 150 },
  { id: "3", name: "Priya Sharma",   phone: "9876543210", eWallet: 0 },
  { id: "4", name: "Anjali Patil",   phone: "9823456789", eWallet: 200 },
];

export const CLIENT_STATS: ClientStats[] = [
  {
    clientId: "1", address: "Pune, Maharashtra",
    rewardPoints: 120, ewalletAmt: 0, unpaidAmt: 1400,
    membership: "Gold", assignDiscount: 10, discountValidity: "31-12-2026",
    noShow: 1, cancelled: 2,
    totalVisit: 14, lastVisit: "05-03-2026",
    totalRevenue: 18500,
    notes: "Prefers Nikita K. for facials", staffAlert: "Allergic to ammonia",
  },
  {
    clientId: "2", address: "Satara, Maharashtra",
    rewardPoints: 80, ewalletAmt: 150, unpaidAmt: 0,
    membership: "Silver", assignDiscount: 5, discountValidity: "30-06-2026",
    noShow: 0, cancelled: 1,
    totalVisit: 9, lastVisit: "24-02-2026",
    totalRevenue: 12300,
    notes: "Priti Gpay", staffAlert: "",
  },
  {
    clientId: "3", address: "Mumbai, Maharashtra",
    rewardPoints: 40, ewalletAmt: 0, unpaidAmt: 0,
    membership: "NA", assignDiscount: 0, discountValidity: "NA",
    noShow: 2, cancelled: 3,
    totalVisit: 6, lastVisit: "10-01-2026",
    totalRevenue: 7200,
    notes: "", staffAlert: "VIP — priority booking",
  },
  {
    clientId: "4", address: "Phaltan, Maharashtra",
    rewardPoints: 200, ewalletAmt: 200, unpaidAmt: 0,
    membership: "Platinum", assignDiscount: 15, discountValidity: "31-03-2027",
    noShow: 0, cancelled: 0,
    totalVisit: 22, lastVisit: "11-03-2026",
    totalRevenue: 34000,
    notes: "Loyal client", staffAlert: "Always confirm 1 day before",
  },
];

export const SERVICES_LIST: string[] = [
  "Choco Revival Facial", "Argan Oil Wax - Full", "Hair Cut",
  "Blow Dry", "Head Massage", "Pedicure", "Manicure",
  "Threading", "Waxing - Arms", "Deep Conditioning",
  "Keratin Treatment", "Hair Color", "Highlights",
  "Nail Art", "Body Polishing",
];

export const PACKAGES_LIST = [
  { id: "p1", name: "Bridal Package", price: 8000, services: ["Hair Color", "Highlights", "Blow Dry", "Manicure"] },
  { id: "p2", name: "Glow Package",   price: 3500, services: ["Choco Revival Facial", "Body Polishing"] },
  { id: "p3", name: "Nail Package",   price: 1200, services: ["Manicure", "Pedicure", "Nail Art"] },
  { id: "p4", name: "Hair Package",   price: 2500, services: ["Hair Cut", "Blow Dry", "Deep Conditioning"] },
];

export const REWARD_POINTS_OPTIONS: string[] = [
  "None", "Silver (50pts)", "Gold (100pts)", "Platinum (200pts)",
];

export const COUPON_CODES: Record<string, number> = {
  SAVE10: 10,
  FLAT50: 50,
  NEW20:  20,
};

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: "b1", clientId: "1", clientName: "Mayuri Jadhav", clientPhone: "9834300856",
    staffId: "6", date: new Date().toISOString().slice(0, 10),
    billDate: new Date().toISOString().slice(0, 10),
    startTime: "09:00", endTime: "09:30",
    services: [{ id: "s1", service: "Choco Revival Facial", staff: "NIKITA K.", staffId: "6", time: "09:00", price: 1400, qty: 1, total: 1400 }],
    status: "Confirmed", paymentStatus: "Unpaid", paymentMode: "Cash",
    subtotal: 1400, taxableAmount: 1400, grandTotal: 1400, payingNow: 0, dueAmount: 1400,
  },
  {
    id: "b2", clientId: "1", clientName: "Mayuri Jadhav", clientPhone: "9834300856",
    staffId: "6", date: new Date().toISOString().slice(0, 10),
    billDate: new Date().toISOString().slice(0, 10),
    startTime: "10:00", endTime: "10:30",
    services: [{ id: "s2", service: "Argan Oil Wax - Full", staff: "NIKITA K.", staffId: "6", time: "10:00", price: 1350, qty: 1, total: 1350 }],
    status: "Confirmed", paymentStatus: "Unpaid", paymentMode: "Cash",
    subtotal: 1350, taxableAmount: 1350, grandTotal: 1350, payingNow: 0, dueAmount: 1350,
  },
];

export const INITIAL_BLOCKED: BlockedTime[] = [];