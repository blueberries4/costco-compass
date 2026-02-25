import { BLUE, TEXT, MUTED } from "../constants";

export default function PageHeader({left, right, gradient, badge}) {
  return (
    <div style={{background:BLUE, padding:"14px 16px"}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <div style={{color:"#fff"}}>
          {left.eyebrow && <div style={{fontSize:11, opacity:0.85, marginBottom:2}}>{left.eyebrow}</div>}
          <div style={{fontSize:18, fontWeight:600, 
            fontFamily:"-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif"}}>
            {left.title}
          </div>
          {left.sub && <div style={{fontSize:11, opacity:0.8, marginTop:2}}>{left.sub}</div>}
        </div>
        {right && (
          <div style={{textAlign:"right", color:"#fff"}}>
            {right.label && <div style={{fontSize:10, opacity:0.8, marginBottom:2}}>{right.label}</div>}
            {right.value && <div style={{fontSize:16, fontWeight:600}}>{right.value}</div>}
          </div>
        )}
        {badge && <div style={{background:"rgba(255,255,255,0.2)", color:"#fff",
          fontSize:11, fontWeight:600, padding:"5px 12px", borderRadius:6}}>{badge.text}</div>}
      </div>
    </div>
  );
}
