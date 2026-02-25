/* ═══════════════════════════════════════════════════════════════
   COSTCO COMPASS — Design Tokens (In-App Experience)
   Styled to match native Costco app screens
   ═══════════════════════════════════════════════════════════════ */

// Official Costco Brand Colors
export const RED = "#E31837";           // Costco primary red
export const BLUE = "#005DAA";          // Costco blue (headers, links)
export const DARK_BLUE = "#003B73";     // Costco dark blue
export const GREEN = "#1D7D1D";         // Success/savings green
export const GOLD = "#C5A000";          // Executive gold
export const AMBER = "#E87722";         // Warning orange

// UI Colors (matching Costco app exactly)
export const BG = "#FFFFFF";            // White background
export const CARD = "#FFFFFF";          // White cards
export const SOFT = "#F5F5F5";          // Light gray backgrounds (Costco app gray)
export const TEXT = "#333333";          // Costco text color
export const MUTED = "#666666";         // Secondary text
export const LIGHT_TEXT = "#999999";    // Tertiary text
export const BORDER = "#E5E5E5";        // Border color
export const DIVIDER = "#EEEEEE";       // Divider lines

// ═══════════════════════════════════════════════════════════════
// TYPOGRAPHY SYSTEM - Mobile First, Costco Style
// ═══════════════════════════════════════════════════════════════
export const FONT = "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', sans-serif";

// Font Sizes (mobile-first scale)
export const TYPO = {
  // Page headers
  pageTitle: { fontSize: 20, fontWeight: 700, letterSpacing: -0.3 },
  pageSubtitle: { fontSize: 13, fontWeight: 500 },
  
  // Section headers
  sectionTitle: { fontSize: 16, fontWeight: 700, letterSpacing: -0.2 },
  sectionSubtitle: { fontSize: 12, fontWeight: 500 },
  
  // Card content
  cardTitle: { fontSize: 15, fontWeight: 600 },
  cardBody: { fontSize: 13, fontWeight: 400 },
  cardMeta: { fontSize: 11, fontWeight: 500 },
  
  // Labels & badges
  label: { fontSize: 11, fontWeight: 600, letterSpacing: 0.3 },
  badge: { fontSize: 10, fontWeight: 700, letterSpacing: 0.5 },
  overline: { fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase" },
  
  // Numbers & stats
  statLarge: { fontSize: 24, fontWeight: 800, letterSpacing: -0.5 },
  statMedium: { fontSize: 18, fontWeight: 700, letterSpacing: -0.3 },
  statSmall: { fontSize: 14, fontWeight: 600 },
  
  // Buttons
  buttonLarge: { fontSize: 15, fontWeight: 700 },
  buttonMedium: { fontSize: 13, fontWeight: 600 },
  buttonSmall: { fontSize: 11, fontWeight: 600 },
  
  // Body text
  body: { fontSize: 14, fontWeight: 400, lineHeight: 1.4 },
  bodySmall: { fontSize: 12, fontWeight: 400, lineHeight: 1.4 },
  caption: { fontSize: 11, fontWeight: 400 },
  
  // Navigation
  navLabel: { fontSize: 10, fontWeight: 500 },
};

export const CAT_COLOR = {
  Groceries:"#F59E0B", Household:"#3B82F6", Gas:"#D92B3A",
  Electronics:"#10B981", Clothing:"#8B5CF6", Health:"#F97316",
  Bakery:"#EC4899", Other:"#6B7280",
};

export const CAT_ICON = {
  Groceries:"🛒", Household:"🏠", Gas:"⛽", Electronics:"💻",
  Clothing:"👕", Health:"💊", Bakery:"🥐", Other:"📦",
};

export const CATS = ["Groceries","Household","Gas","Electronics","Clothing","Health","Bakery","Other"];

export const MEMBER = {
  type:"Executive", fee:130, startDate:"2025-09-01",
  household:["You","Partner"],
  cashbackRate:0.02, cashbackMax:1000,
  gasCashbackRate:0.04,
};

export const WAREHOUSES = [
  {id:"0013", name:"Chaska",     address:"1251 Hazeltine Blvd, Chaska, MN"},
  {id:"0092", name:"Minnetonka", address:"10 Theatre Dr, Minnetonka, MN"},
  {id:"0449", name:"Eagan",      address:"1275 Promenade Pl, Eagan, MN"},
];

export const WAREHOUSE_STOCK = {
  "Sony WH-1000XM5":       {"0013":"In Stock",    "0092":"Limited",      "0449":"Out of Stock"},
  "Dyson V15 Vacuum":      {"0013":"In Stock",    "0092":"In Stock",     "0449":"Limited"},
  "Kirkland Laundry Pods": {"0013":"In Stock",    "0092":"In Stock",     "0449":"In Stock"},
  "Instant Pot Duo 8qt":   {"0013":"Limited",     "0092":"Out of Stock", "0449":"In Stock"},
  "Weber Kettle Grill":    {"0013":"Out of Stock","0092":"Limited",      "0449":"Out of Stock"},
};
