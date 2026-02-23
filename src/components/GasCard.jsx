import { Card } from "./atoms";
import { AMBER, BLUE, GOLD, MUTED, RED, SOFT, TEXT, MEMBER } from "../constants";
import { daysBetween, fmt, relDate, today } from "../helpers";

export default function GasCard({gasItems, animDelay=0}) {
  if(!gasItems.length) return null;

  const totalCashback = gasItems.reduce((s,i) => s + i.amount * MEMBER.gasCashbackRate, 0);
  const totalSpend = gasItems.reduce((s,i) => s + i.amount, 0);
  const avgFillCost = totalSpend / gasItems.length;

  const sortedDates = [...new Set(gasItems.map(i => i.date))].sort();
  const gaps = [];
  for(let i=1; i<sortedDates.length; i++) gaps.push(daysBetween(sortedDates[i-1], sortedDates[i]));
  const avgGap = gaps.length ? Math.round(gaps.reduce((a,b) => a+b, 0) / gaps.length) : 18;
  const lastFillDate = sortedDates[sortedDates.length-1];
  const daysSince = daysBetween(lastFillDate, today());
  const duePct = Math.min(Math.round((daysSince/avgGap)*100), 100);
  const isDue = duePct >= 85;

  const spark = gasItems
    .sort((a,b) => a.date.localeCompare(b.date))
    .slice(-5);

  return (
    <Card animDelay={animDelay}
      style={{border: isDue ? `1px solid ${AMBER}28` : "1px solid transparent"}}>
      {/* Header */}
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10}}>
        <div style={{display:"flex", alignItems:"center", gap:9}}>
          <div style={{width:34, height:34, borderRadius:10, background:`${RED}10`,
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:18}}>⛽</div>
          <div>
            <div style={{fontSize:12, fontWeight:600, color:TEXT}}>Gas at Costco</div>
            <div style={{fontSize:10, color:isDue ? AMBER : MUTED}}>
              {isDue ? `⚠ ${daysSince}d since last fill-up` : `Last fill-up ${relDate(lastFillDate)}`}
            </div>
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:9, color:MUTED, marginBottom:2}}>4% CASHBACK EARNED</div>
          <div style={{fontSize:17, fontWeight:700, color:GOLD,
            fontFamily:"'Barlow Condensed',sans-serif"}}>{fmt(totalCashback)}</div>
        </div>
      </div>

      {/* Stats tiles */}
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginBottom:10}}>
        {[
          {label:"Fill-ups", val:`${gasItems.length}`, col:TEXT},
          {label:"Avg fill cost", val:fmt(avgFillCost).replace("$","$"), col:TEXT},
          {label:"Avg gap", val:`${avgGap}d`, col:BLUE},
        ].map(s => (
          <div key={s.label} style={{background:SOFT, borderRadius:9, padding:"8px", textAlign:"center"}}>
            <div style={{fontSize:13, fontWeight:600, color:s.col,
              fontFamily:"'Barlow Condensed',sans-serif"}}>{s.val}</div>
            <div style={{fontSize:9, color:MUTED, marginTop:1, lineHeight:1.3}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Due indicator */}
      <div style={{marginBottom: isDue ? 8 : 0}}>
        <div style={{display:"flex", justifyContent:"space-between", fontSize:9, color:MUTED, marginBottom:3}}>
          <span>Next fill-up</span>
          <span style={{color: isDue ? AMBER : MUTED, fontWeight: isDue ? 600 : 400}}>
            {duePct}% of avg {avgGap}d cycle
          </span>
        </div>
        <div style={{height:3, background:SOFT, borderRadius:2, overflow:"hidden"}}>
          <div className="fbar" style={{height:"100%", borderRadius:2,
            width:`${duePct}%`, background: isDue ? AMBER : BLUE}}/>
        </div>
      </div>

      {isDue && (
        <div style={{background:AMBER+"0E", borderRadius:9, padding:"7px 10px",
          fontSize:10, color:AMBER, fontWeight:500, display:"flex", gap:6, alignItems:"center"}}>
          <span>⛽</span>
          <span>You're probably due — avg every {avgGap} days, it's been {daysSince}</span>
        </div>
      )}

      {/* Spend sparkline */}
      {spark.length > 1 && (
        <div style={{marginTop:10}}>
          <div style={{fontSize:9, color:MUTED, marginBottom:4, textTransform:"uppercase", letterSpacing:"0.06em"}}>
            Last {spark.length} fill-up costs
          </div>
          <div style={{display:"flex", alignItems:"flex-end", gap:3, height:32}}>
            {spark.map((d,i) => {
              const max = Math.max(...spark.map(x => x.amount));
              const min = Math.min(...spark.map(x => x.amount));
              const h = Math.round(8 + ((d.amount - min) / Math.max(max - min, 1)) * 22);
              const isLast = i === spark.length - 1;
              return (
                <div key={i} style={{flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2}}>
                  <div style={{width:"100%", height:h, borderRadius:2,
                    background: isLast ? RED : `${RED}38`}}/>
                  <div style={{fontSize:8, color: isLast ? TEXT : MUTED, fontFamily:"'DM Mono',monospace"}}>
                    {d.amount.toFixed(0)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
