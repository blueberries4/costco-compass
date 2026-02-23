import { useState } from "react";
import { BLUE, BORDER, CARD, CAT_ICON, GOLD, GREEN, MUTED, RED, SOFT, TEXT } from "../constants";
import { calcCashback, fmt, relDate, tripScore } from "../helpers";
import { Pill } from "./atoms";
import TripScoreBadge from "./TripScoreBadge";

export default function TripCard({trip, delay=0, onDelete}) {
  const [open, setOpen] = useState(false);
  const total = trip.items.reduce((s,i) => s + i.amount, 0);
  const saved = trip.items.reduce((s,i) => s + (i.retailPrice && i.retailPrice > i.amount ? i.retailPrice - i.amount : 0), 0);
  const cb = calcCashback(trip.items);
  const impulse = trip.items.filter(i => !i.planned);
  const impPct = Math.round((impulse.length / Math.max(trip.items.length, 1)) * 100);
  const score = trip.tripScore ?? tripScore(trip);

  return (
    <div className="lift" style={{background:CARD, borderRadius:16, overflow:"hidden",
      boxShadow:"0 2px 8px rgba(0,0,0,0.05)", animation:`fadeUp 0.3s ${delay}s ease both`}}>
      <div style={{padding:"13px 15px 11px", cursor:"pointer"}} onClick={() => setOpen(o => !o)}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10}}>
          <div style={{flex:1, minWidth:0}}>
            <div style={{display:"flex", alignItems:"center", gap:5, marginBottom:3, flexWrap:"wrap"}}>
              <span style={{fontSize:10, color:MUTED}}>{relDate(trip.date)}</span>
              <span style={{fontSize:9, color:MUTED, background:SOFT, padding:"1px 6px", borderRadius:20}}>
                {trip.addedBy === "Partner" ? "🙋‍♀️" : "🙋‍♂️"} {trip.addedBy}
              </span>
              <span style={{fontSize:9, color:MUTED}}>· auto-imported</span>
            </div>
            <div style={{fontSize:14, fontWeight:600, color:TEXT,
              fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:"0.2px",
              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
              {trip.notes || "Costco Run"}
            </div>
          </div>
          <div style={{textAlign:"right", flexShrink:0}}>
            <div style={{fontSize:16, fontWeight:600, color:TEXT, fontFamily:"'DM Mono',monospace"}}>{fmt(total)}</div>
            <div style={{fontSize:9, color:GOLD, marginTop:1}}>+{fmt(cb)} back</div>
            {saved > 0 && <div style={{fontSize:9, color:GREEN}}>saved {fmt(saved)}</div>}
          </div>
        </div>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:9}}>
          <div style={{display:"flex", gap:5, flexWrap:"wrap"}}>
            <Pill label={`${trip.items.length} items`} col={BLUE}/>
            <Pill label={`${impPct}% impulse`} col={impPct > 40 ? RED : MUTED}/>
          </div>
          <TripScoreBadge score={score}/>
        </div>
        <div style={{height:2, background:SOFT, borderRadius:1, overflow:"hidden", marginTop:8}}>
          <div style={{height:"100%", background:BLUE, borderRadius:1, width:`${100 - impPct}%`}}/>
        </div>
      </div>

      {open && (
        <div style={{borderTop:`1px solid ${BORDER}`}}>
          {trip.items.map((it, i) => {
            return (
              <div key={it.id} style={{display:"flex", alignItems:"center", justifyContent:"space-between",
                padding:"9px 15px", borderBottom: i < trip.items.length - 1 ? `1px solid ${BORDER}` : "none",
                background: it.planned ? "transparent" : `${RED}03`}}>
                <div style={{display:"flex", alignItems:"center", gap:7, minWidth:0}}>
                  <span style={{fontSize:13}}>{CAT_ICON[it.category]}</span>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:12, fontWeight:500, color:TEXT,
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{it.name}</div>
                    <div style={{display:"flex", gap:4, marginTop:1}}>
                      {!it.planned && <span style={{fontSize:9, color:RED, fontWeight:500}}>IMPULSE</span>}
                      {it.kirkland && <span style={{fontSize:9, color:"#8B5CF6", fontWeight:500}}>KIRKLAND</span>}
                    </div>
                  </div>
                </div>
                <div style={{textAlign:"right", flexShrink:0}}>
                  <div style={{fontSize:11, fontWeight:500, fontFamily:"'DM Mono',monospace", color:TEXT}}>
                    {fmt(it.amount)}
                  </div>
                  {it.retailPrice && it.retailPrice > it.amount && (
                    <div style={{fontSize:9, color:GREEN}}>saved {fmt(it.retailPrice - it.amount)}</div>
                  )}
                </div>
              </div>
            );
          })}
          <div style={{padding:"8px 15px", display:"flex", justifyContent:"flex-end"}}>
            <button className="tap" onClick={() => onDelete(trip.id)}
              style={{background:"none", border:`1px solid ${BORDER}`, color:MUTED, padding:"4px 11px",
                borderRadius:50, fontSize:10, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
