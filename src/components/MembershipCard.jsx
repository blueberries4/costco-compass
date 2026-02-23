import { RED, MEMBER } from "../constants";
import { fmt, memberYear, formatPaidOffDate, weeksUntil, daysBetween, today } from "../helpers";

export default function MembershipCard({totalSaved, fee, cashbackYTD, projectedAnnual, paidOffDate}) {
  const roiPct   = Math.min(Math.round((totalSaved/fee)*100), 100);
  const isEarned = totalSaved >= fee;
  const cbPct    = Math.min(Math.round((cashbackYTD/MEMBER.cashbackMax)*100), 100);
  const {end}    = memberYear();
  const checkDate = new Date(end).toLocaleDateString("en-US", {month:"short", day:"numeric"});
  const weeksToCheck = weeksUntil(end);
  const paidOffFormatted = formatPaidOffDate(paidOffDate);

  return (
    <div className={isEarned ? "glow" : ""} style={{
      background:`linear-gradient(135deg,${RED} 0%,#9E001A 100%)`,
      borderRadius:18, padding:"16px 18px", color:"#fff", position:"relative", overflow:"hidden",
      boxShadow:`0 5px 20px ${RED}40`, animation:"fadeUp 0.35s ease both"}}>
      <div style={{position:"absolute", top:-24, right:-24, width:90, height:90,
        borderRadius:"50%", background:"rgba(255,255,255,0.05)"}}/>
      <div style={{position:"relative"}}>

        {/* Header row */}
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10}}>
          <div>
            <div style={{fontSize:8, letterSpacing:"0.12em", opacity:0.55, marginBottom:3}}>
              COSTCO {MEMBER.type.toUpperCase()} · ROI
            </div>
            <div style={{fontSize:30, fontWeight:700, fontFamily:"'Barlow Condensed',sans-serif",
              letterSpacing:"0.3px", lineHeight:1}}>{fmt(totalSaved)}</div>
            <div style={{fontSize:10, opacity:0.6, marginTop:1}}>saved vs retail</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:8, opacity:0.55, marginBottom:2}}>ANNUAL FEE</div>
            <div style={{fontSize:15, fontWeight:600, fontFamily:"'DM Mono',monospace"}}>{fmt(fee)}</div>
            <div style={{fontSize:8, opacity:0.6, marginTop:4,
              background:"rgba(255,255,255,0.12)", borderRadius:20, padding:"2px 7px"}}>
              {roiPct}% recovered
            </div>
          </div>
        </div>

        {/* ROI bar */}
        <div style={{height:3, background:"rgba(255,255,255,0.15)", borderRadius:2, overflow:"hidden", marginBottom:4}}>
          <div className="fbar" style={{height:"100%", borderRadius:2, width:`${roiPct}%`,
            background:isEarned ? "#fff" : "rgba(255,255,255,0.78)",
            boxShadow:isEarned ? "0 0 6px rgba(255,255,255,0.45)" : "none"}}/>
        </div>
        <div style={{fontSize:10, opacity:0.75, marginBottom:12, lineHeight:1.4}}>
          {isEarned
            ? `🎉 Membership paid for itself${paidOffFormatted ? ` on ${paidOffFormatted}` : ""}! You're ${fmt(totalSaved-fee)} ahead.`
            : `${fmt(fee-Math.min(totalSaved, fee))} more savings to break even`}
        </div>

        {/* Cashback secondary row */}
        {MEMBER.type === "Executive" && (
          <div style={{borderTop:"1px solid rgba(255,255,255,0.13)", paddingTop:10,
            display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <div>
              <div style={{fontSize:8, opacity:0.55, letterSpacing:"0.08em", marginBottom:2}}>
                2% + 4% GAS CASHBACK
              </div>
              <div style={{display:"flex", alignItems:"baseline", gap:5}}>
                <span style={{fontSize:18, fontWeight:700, fontFamily:"'Barlow Condensed',sans-serif"}}>
                  {fmt(cashbackYTD)}
                </span>
                <span style={{fontSize:9, opacity:0.6}}>est. {fmt(projectedAnnual)}/yr</span>
              </div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:8, opacity:0.55, marginBottom:2}}>CHECK ARRIVES</div>
              <div style={{fontSize:11, fontWeight:600}}>in {weeksToCheck}</div>
              <div style={{marginTop:3, height:2, width:52, background:"rgba(255,255,255,0.15)",
                borderRadius:1, overflow:"hidden", marginLeft:"auto"}}>
                <div className="fbar" style={{height:"100%", background:"rgba(255,255,255,0.65)", width:`${cbPct}%`}}/>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
