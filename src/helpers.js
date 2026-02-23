import { MEMBER } from "./constants";

export const fmt = n => "$"+n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,",");

export const fmtShort = n => n>=1000?`$${(n/1000).toFixed(1)}k`:fmt(n);

export const today = () => new Date().toISOString().split("T")[0];

export const daysBetween = (a,b) => Math.round(Math.abs(new Date(b)-new Date(a))/(1000*60*60*24));

export const formatPaidOffDate = d => {
  if(!d) return null;
  const date = new Date(d);
  return date.toLocaleDateString("en-US", {month:"long", day:"numeric"});
};

export const weeksUntil = d => {
  const days = daysBetween(today(), d);
  if(days <= 0) return "now";
  if(days < 7) return `${days} days`;
  const weeks = Math.round(days / 7);
  return `${weeks} week${weeks !== 1 ? 's' : ''}`;
};

export const relDate = d => {
  const days = daysBetween(d,today());
  if(days===0) return "Today";
  if(days===1) return "Yesterday";
  if(days<7)   return `${days}d ago`;
  if(days<30)  return `${Math.round(days/7)}wk ago`;
  return `${Math.round(days/30)}mo ago`;
};

export const memberYear = () => {
  const s = new Date(MEMBER.startDate);
  const n = new Date();
  const yr = n >= new Date(s.getFullYear(), s.getMonth(), s.getDate()) &&
             n <  new Date(s.getFullYear()+1, s.getMonth(), s.getDate())
               ? s.getFullYear() : s.getFullYear()-1;
  const p = v => String(v).padStart(2,"0");
  return {
    start: `${yr}-${p(s.getMonth()+1)}-${p(s.getDate())}`,
    end:   `${yr+1}-${p(s.getMonth()+1)}-${p(s.getDate())}`,
  };
};

export const calcCashback = items => items.reduce((s,i) =>
  i.category === "Gas" ? s + i.amount * MEMBER.gasCashbackRate : s + i.amount * MEMBER.cashbackRate, 0);

export const tripScore = trip => {
  const items = trip.items;
  if(!items.length) return 0;
  const planned = items.filter(i => i.planned).length;
  const planPct = (planned / items.length) * 100;
  const savedItems = items.filter(i => i.retailPrice && i.retailPrice > i.amount);
  const savingsPct = savedItems.length ? Math.min((savedItems.length / items.length) * 60, 40) : 0;
  return Math.round(Math.min(planPct * 0.6 + savingsPct, 100));
};
