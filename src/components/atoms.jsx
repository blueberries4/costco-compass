import { BLUE, CARD, SOFT, MUTED, TEXT, BORDER } from "../constants";

export const Pill = ({label, col, bg}) => {
  return (
    <span style={{fontSize:9, fontWeight:600, color:col||MUTED,
      background:bg||(col?col+"14":SOFT), padding:"2px 7px", borderRadius:20, whiteSpace:"nowrap"}}>
      {label}
    </span>
  );
};

export const Divider = () => {
  return <div style={{height:1, background:BORDER, margin:"2px 0"}}/>;
};

export function Card({children, style={}, className="", animDelay=0}) {
  return (
    <div className={`lift ${className}`}
      style={{background:CARD, borderRadius:16, padding:"14px 16px",
        boxShadow:"0 2px 8px rgba(0,0,0,0.05)",
        animation:`fadeUp 0.3s ${animDelay}s ease both`, ...style}}>
      {children}
    </div>
  );
}

export function CardTitle({children, sub, action, onAction}) {
  return (
    <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:10}}>
      <div>
        <div style={{fontSize:12, fontWeight:600, color:TEXT}}>{children}</div>
        {sub && <div style={{fontSize:10, color:MUTED, marginTop:1}}>{sub}</div>}
      </div>
      {action && <button onClick={onAction}
        style={{background:"none", border:"none", fontSize:11, color:BLUE,
          cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:600}}>
        {action}
      </button>}
    </div>
  );
}
