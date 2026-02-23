import { AMBER, GREEN, RED } from "../constants";

export default function TripScoreBadge({score, size="sm"}) {
  const col = score >= 80 ? GREEN : score >= 65 ? AMBER : RED;
  const label = score >= 80 ? "On track" : score >= 65 ? "Good" : score >= 50 ? "Fair" : "Off plan";
  
  if(size === "lg") return (
    <div style={{textAlign:"center"}}>
      <div style={{fontSize:36, fontWeight:700, color:col, fontFamily:"'Barlow Condensed',sans-serif", lineHeight:1}}>
        {score}
      </div>
      <div style={{fontSize:10, color:col, fontWeight:600, marginTop:2}}>{label}</div>
    </div>
  );
  
  return (
    <div style={{background:col+"12", borderRadius:20, padding:"3px 9px",
      display:"flex", alignItems:"center", gap:4}}>
      <div style={{width:5, height:5, borderRadius:"50%", background:col}}/>
      <span style={{fontSize:10, fontWeight:600, color:col}}>{score} · {label}</span>
    </div>
  );
}
