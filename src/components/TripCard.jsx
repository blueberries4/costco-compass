import { useState } from "react";
import { BLUE, BORDER, CARD, CAT_ICON, FONT, GOLD, GREEN, MUTED, RED, SOFT, TEXT, TYPO } from "../constants";
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
              <span style={{...TYPO.caption, color:MUTED, fontFamily:FONT}}>{relDate(trip.date)}</span>
              <span style={{...TYPO.badge, color:MUTED, background:SOFT, padding:"1px 6px", borderRadius:20, fontFamily:FONT}}>
                {trip.addedBy === "Partner" ? "🙋‍♀️" : "🙋‍♂️"} {trip.addedBy}
              </span>
              <span style={{...TYPO.badge, color:MUTED, fontFamily:FONT}}>· auto-imported</span>
            </div>
            <div style={{...TYPO.cardTitle, color:TEXT, fontFamily:FONT,
              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
              {trip.notes || "Costco Run"}
            </div>
          </div>
          <div style={{textAlign:"right", flexShrink:0}}>
            <div style={{...TYPO.sectionTitle, color:TEXT, fontFamily:FONT}}>{fmt(total)}</div>
            <div style={{...TYPO.badge, color:GOLD, marginTop:1, fontFamily:FONT}}>+{fmt(cb)} back</div>
            {saved > 0 && <div style={{...TYPO.badge, color:GREEN, fontFamily:FONT}}>saved {fmt(saved)}</div>}
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
                    <div style={{...TYPO.cardBody, fontWeight:500, color:TEXT, fontFamily:FONT,
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{it.name}</div>
                    <div style={{display:"flex", gap:4, marginTop:1}}>
                      {!it.planned && <span style={{...TYPO.badge, color:RED, fontWeight:600, fontFamily:FONT}}>IMPULSE</span>}
                      {it.kirkland && <span style={{...TYPO.badge, color:"#8B5CF6", fontWeight:600, fontFamily:FONT}}>KIRKLAND</span>}
                    </div>
                  </div>
                </div>
                <div style={{textAlign:"right", flexShrink:0}}>
                  <div style={{...TYPO.cardMeta, fontWeight:500, color:TEXT, fontFamily:FONT}}>
                    {fmt(it.amount)}
                  </div>
                  {it.retailPrice && it.retailPrice > it.amount && (
                    <div style={{...TYPO.badge, color:GREEN, fontFamily:FONT}}>saved {fmt(it.retailPrice - it.amount)}</div>
                  )}
                </div>
              </div>
            );
          })}
          <div style={{padding:"8px 15px", display:"flex", justifyContent:"flex-end"}}>
            <button className="tap" onClick={() => onDelete(trip.id)}
              style={{background:"none", border:`1px solid ${BORDER}`, color:MUTED, padding:"4px 11px",
                borderRadius:50, ...TYPO.caption, cursor:"pointer", fontFamily:FONT}}>
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
