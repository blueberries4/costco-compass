import { MUTED, RED, BORDER, TEXT, BLUE, FONT, TYPO } from "../constants";

export default function BottomNav({tab, setTab}) {
  // SVG icons matching Costco app style
  const icons = {
    home: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? RED : "#666"} strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    list: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? RED : "#666"} strokeWidth="2">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/>
        <path d="M9 12h6M9 16h6"/>
      </svg>
    ),
    trips: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? RED : "#666"} strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    deals: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? RED : "#666"} strokeWidth="2">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
        <line x1="7" y1="7" x2="7.01" y2="7"/>
      </svg>
    ),
  };

  const TABS = [
    {id:"home", icon: icons.home, label:"Home"},
    {id:"deals", icon: icons.deals, label:"Deals"},
    {id:"list", icon: icons.list, label:"Lists"},
    {id:"trips", icon: icons.trips, label:"History"},
  ];
  
  return (
    <div style={{position:"absolute", bottom:0, left:0, right:0,
      background:"#FFFFFF", borderTop:"1px solid #E5E5E5"}}>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", padding:"8px 0 20px"}}>
        {TABS.map(t => {
          const on = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{background:"none", border:"none", cursor:"pointer", display:"flex",
                flexDirection:"column", alignItems:"center", gap:4, padding:"4px 0",
                fontFamily:FONT}}>
              {t.icon(on)}
              <div style={{...TYPO.navLabel, fontWeight: on ? 600 : 400, 
                color: on ? RED : "#666", fontFamily:FONT}}>{t.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
