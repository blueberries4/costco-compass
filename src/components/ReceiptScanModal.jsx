import { useState } from "react";
import { BLUE, BORDER, CARD, CAT_COLOR, CAT_ICON, CATS, MUTED, RED, SOFT, TEXT } from "../constants";
import { fmt } from "../helpers";

export default function ReceiptScanModal({onParsed, onClose}) {
  const [raw, setRaw] = useState("");
  const [parsed, setParsed] = useState(null);
  const SAMPLE = `Gas Fill-Up | $61.20 | Gas\nKirkland Coffee 3lb | $39.99 | Groceries\nAtlantic Salmon | $36.49 | Groceries\nKirkland Mixed Nuts | $24.99 | Groceries\nTide Pods 152ct | $29.99 | Household`;

  const parse = () => {
    const items = raw.trim().split("\n").filter(l => l.trim()).map((line, i) => {
      const p = line.split("|").map(x => x.trim());
      const name = p[0] || "Item";
      const amount = parseFloat((p[1] || "0").replace(/[^0-9.]/g, "")) || 0;
      const category = CATS.includes(p[2]) ? p[2] : "Other";
      return {id: Date.now() + i, name, amount, category,
        kirkland: name.toLowerCase().includes("kirkland"), planned: true, retailPrice: null};
    }).filter(i => i.amount > 0);
    setParsed(items);
  };
  
  const total = parsed ? parsed.reduce((s, i) => s + i.amount, 0) : 0;

  return (
    <div style={{position:"fixed", inset:0, zIndex:600, display:"flex", justifyContent:"center",
      animation:"fadeIn 0.15s ease"}}>
      <div onClick={onClose} style={{position:"absolute", inset:0,
        background:"rgba(0,0,0,0.44)", backdropFilter:"blur(8px)"}}/>
      <div style={{position:"relative", width:"100%", maxWidth:430, height:"100%",
        display:"flex", flexDirection:"column", justifyContent:"flex-end"}}>
        <div style={{position:"relative", background:CARD, borderRadius:"22px 22px 0 0",
          maxHeight:"85vh", display:"flex", flexDirection:"column",
          animation:"slideUp 0.26s cubic-bezier(.34,1.2,.64,1) both",
          boxShadow:"0 -8px 36px rgba(0,0,0,0.15)"}}>
        <div style={{width:32, height:4, background:"#E0D8D0", borderRadius:2, margin:"13px auto 0", flexShrink:0}}/>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"10px 18px 0", flexShrink:0}}>
          <div style={{fontSize:16, fontWeight:700, color:TEXT, fontFamily:"'Barlow Condensed',sans-serif"}}>
            {parsed ? "✓ Review Items" : "📷 Scan Receipt"}
          </div>
          <button className="tap" onClick={onClose}
            style={{background:SOFT, border:"none", color:MUTED, width:26, height:26, borderRadius:"50%",
              cursor:"pointer", fontSize:11, display:"flex", alignItems:"center", justifyContent:"center"}}>✕</button>
        </div>
        <div style={{overflowY:"auto", padding:"12px 18px 26px", flexGrow:1}}>
          {!parsed ? (
            <div style={{display:"flex", flexDirection:"column", gap:9}}>
              <div style={{background:`${BLUE}10`, border:`1px solid ${BLUE}16`, borderRadius:12,
                padding:"11px 13px", display:"flex", gap:9, alignItems:"center"}}>
                <span style={{fontSize:18}}>🔗</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:12, fontWeight:600, color:BLUE}}>Auto-import from Costco App</div>
                  <div style={{fontSize:10, color:MUTED, marginTop:1}}>
                    Link your account to skip manual entry — coming soon
                  </div>
                </div>
                <span style={{fontSize:9, fontWeight:600, color:BLUE, background:BLUE+"14",
                  padding:"2px 7px", borderRadius:20}}>SOON</span>
              </div>
              <div style={{fontSize:10, color:MUTED, textAlign:"center"}}>— or paste receipt text —</div>
              <textarea value={raw} onChange={e => setRaw(e.target.value)} rows={6}
                placeholder={`Item Name | $Price | Category\n\n${SAMPLE}`}
                style={{width:"100%", background:SOFT, border:"1.5px solid transparent", borderRadius:11,
                  padding:"11px", fontSize:12, color:TEXT, fontFamily:"'DM Mono',monospace",
                  resize:"none", lineHeight:1.7}}/>
              <button className="tap" onClick={() => setRaw(SAMPLE)}
                style={{background:"none", border:`1px dashed ${BORDER}`, borderRadius:9, padding:"8px",
                  fontSize:11, color:MUTED, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                Load sample receipt
              </button>
              <button className="tap" onClick={parse}
                style={{background: raw.trim() ? RED : "#C5BDB5", color:"#fff", border:"none", borderRadius:50,
                  padding:"12px", fontSize:13, fontWeight:600, cursor: raw.trim() ? "pointer" : "default",
                  fontFamily:"'Plus Jakarta Sans',sans-serif", transition:"all 0.18s",
                  boxShadow: raw.trim() ? `0 3px 10px ${RED}38` : "none"}}>
                Parse Receipt →
              </button>
            </div>
          ) : (
            <div style={{display:"flex", flexDirection:"column", gap:7}}>
              {parsed.map((it, i) => (
                <div key={it.id} style={{display:"flex", alignItems:"center", gap:8,
                  background:SOFT, borderRadius:11, padding:"10px 12px",
                  animation:`fadeUp 0.22s ${i*0.04}s ease both`}}>
                  <span style={{fontSize:15}}>{CAT_ICON[it.category]}</span>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:12, fontWeight:500, color:TEXT,
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{it.name}</div>
                    <div style={{display:"flex", gap:4, marginTop:2}}>
                      <span style={{fontSize:9, color:CAT_COLOR[it.category],
                        background:CAT_COLOR[it.category]+"12", padding:"1px 5px", borderRadius:9}}>
                        {it.category}
                      </span>
                      {it.kirkland && <span style={{fontSize:9, color:"#8B5CF6",
                        background:"#8B5CF610", padding:"1px 5px", borderRadius:9}}>Kirkland</span>}
                    </div>
                  </div>
                  <span style={{fontSize:11, fontWeight:500, color:TEXT,
                    fontFamily:"'DM Mono',monospace", flexShrink:0}}>{fmt(it.amount)}</span>
                </div>
              ))}
              <div style={{background:TEXT, borderRadius:11, padding:"11px 13px",
                display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <span style={{fontSize:11, color:"rgba(255,255,255,0.6)"}}>Total</span>
                <span style={{fontSize:13, fontWeight:600, color:"#fff",
                  fontFamily:"'DM Mono',monospace"}}>{fmt(total)}</span>
              </div>
              <button className="tap" onClick={() => onParsed(parsed)}
                style={{background:RED, color:"#fff", border:"none", borderRadius:50, padding:"12px",
                  fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif",
                  boxShadow:`0 3px 10px ${RED}38`}}>
                Add as Trip
              </button>
              <button className="tap" onClick={() => setParsed(null)}
                style={{background:"none", border:"none", color:MUTED, fontSize:11,
                  cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif", padding:"3px"}}>
                ← Edit
              </button>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
