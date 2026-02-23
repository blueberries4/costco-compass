export const RED    = "#D92B3A";
export const BLUE   = "#005DAA";
export const GREEN  = "#16a34a";
export const AMBER  = "#d97706";
export const GOLD   = "#A07800";
export const BG     = "#F0EBE2";
export const CARD   = "#FFFFFF";
export const TEXT   = "#1C1712";
export const MUTED  = "#9A8E84";
export const SOFT   = "#F4F0EA";
export const BORDER = "rgba(0,0,0,0.07)";

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
