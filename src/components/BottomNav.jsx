import { MUTED, RED, BORDER } from "../constants";

export default function BottomNav({tab, setTab}) {
  const TABS = [
    {id:"home",     icon:"◉",  label:"Home"},
    {id:"list",     icon:"☑",  label:"List"},
    {id:"trips",    icon:"🛒", label:"Trips"},
    {id:"insights", icon:"↗",  label:"Insights"},
  ];
  
  return (
    <div style={{position:"absolute", bottom:0, left:0, right:0,
      background:"rgba(247,243,238,0.96)", backdropFilter:"blur(20px)",
      borderTop:`1px solid ${BORDER}`}}>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", padding:"5px 0 6px"}}>
        {TABS.map(t => {
          const on = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{background:"none", border:"none", cursor:"pointer", display:"flex",
                flexDirection:"column", alignItems:"center", gap:1, padding:"3px 0",
                color: on ? RED : MUTED, fontFamily:"'Plus Jakarta Sans',sans-serif",
                transition:"color 0.13s"}}>
              <div style={{fontSize:16, transition:"transform 0.15s cubic-bezier(.34,1.5,.64,1)",
                transform: on ? "scale(1.14)" : "scale(1)"}}>{t.icon}</div>
              <div style={{fontSize:9, fontWeight: on ? 600 : 400}}>{t.label}</div>
              {on && <div style={{width:3, height:3, borderRadius:"50%", background:RED, marginTop:1}}/>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
