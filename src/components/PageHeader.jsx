import { RED, TEXT, MUTED } from "../constants";

export default function PageHeader({left, right, gradient, badge}) {
  return (
    <div style={{background:gradient||"linear-gradient(145deg,#FFF9F5,#FDEAEA)",
      padding:"42px 20px 14px", position:"relative", overflow:"hidden"}}>
      <div style={{position:"absolute", top:-30, right:-30, width:95, height:95,
        borderRadius:"50%", background:`${RED}06`}}/>
      <div style={{position:"relative", display:"flex", justifyContent:"space-between", alignItems:"flex-end"}}>
        <div>
          {left.eyebrow && <div style={{fontSize:9, fontWeight:500, color:MUTED,
            letterSpacing:"0.08em", marginBottom:3, textTransform:"uppercase"}}>{left.eyebrow}</div>}
          <div style={{fontSize:22, fontWeight:700, color:TEXT,
            fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:"0.3px", lineHeight:1}}>
            {left.title}
          </div>
          {left.sub && <div style={{fontSize:11, color:MUTED, marginTop:3}}>{left.sub}</div>}
        </div>
        {right && (
          <div style={{textAlign:"right", flexShrink:0}}>
            {right.label && <div style={{fontSize:9, color:MUTED, marginBottom:1}}>{right.label}</div>}
            {right.value && <div style={{fontSize:12, fontWeight:600, color:TEXT}}>{right.value}</div>}
          </div>
        )}
        {badge && <div style={{background:badge.bg||RED+"14", color:badge.col||RED,
          fontSize:10, fontWeight:600, padding:"4px 10px", borderRadius:20}}>{badge.text}</div>}
      </div>
    </div>
  );
}
