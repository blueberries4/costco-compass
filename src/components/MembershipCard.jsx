import { RED, MEMBER, GOLD, MUTED, TEXT, GREEN, BLUE, FONT, TYPO } from "../constants";
import { fmt, memberYear, formatPaidOffDate, weeksUntil } from "../helpers";

export default function MembershipCard({totalSaved, fee, cashbackYTD, projectedAnnual, paidOffDate}) {
  const roiPct   = Math.min(Math.round((totalSaved/fee)*100), 100);
  const isEarned = totalSaved >= fee;
  const {end}    = memberYear();
  const weeksToCheck = weeksUntil(end);
  const paidOffFormatted = formatPaidOffDate(paidOffDate);
  const isExecutive = MEMBER.type === "Executive";

  // Card colors - matches real Costco card
  const cardBg = isExecutive 
    ? "linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)"
    : "linear-gradient(145deg, #E31837 0%, #c41230 50%, #E31837 100%)";
  const accentColor = isExecutive ? GOLD : "#fff";

  return (
    <div style={{
      background: cardBg,
      borderRadius: 14,
      overflow: "hidden",
      boxShadow: "0 8px 24px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.12)",
      animation: "fadeUp 0.25s ease both",
      position: "relative",
    }}>
      {/* Subtle shine effect */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "50%",
        background: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)",
        pointerEvents: "none",
      }}/>

      {/* Card Header - Member type & stars */}
      <div style={{padding: "16px 18px 12px", position: "relative"}}>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start"}}>
          <div>
            <div style={{
              ...TYPO.badge,
              color: "rgba(255,255,255,0.6)",
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginBottom: 4,
              fontFamily: FONT,
            }}>
              Membership
            </div>
            <div style={{
              ...TYPO.pageTitle,
              color: accentColor,
              fontFamily: FONT,
              letterSpacing: 0.5,
            }}>
              {MEMBER.type}
            </div>
          </div>
          {isExecutive && (
            <div style={{
              display: "flex",
              gap: 2,
              marginTop: 4,
            }}>
              {[1,2].map(i => (
                <span key={i} style={{fontSize: 14, color: GOLD}}>★</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Member Info */}
      <div style={{padding: "0 18px 14px"}}>
        <div style={{
          ...TYPO.sectionTitle,
          color: "#fff",
          fontFamily: FONT,
          letterSpacing: 0.3,
        }}>
          {MEMBER.household[0]}
        </div>
        <div style={{
          ...TYPO.caption,
          color: "rgba(255,255,255,0.5)",
          marginTop: 3,
          fontFamily: "monospace",
          letterSpacing: 1,
        }}>
          ●●●● ●●●● {MEMBER.memberNum?.toString().slice(-4) || "1234"}
        </div>
      </div>

      {/* Divider line */}
      <div style={{
        height: 1,
        background: isExecutive 
          ? "linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)"
          : "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
        margin: "0 18px",
      }}/>

      {/* Value Stats */}
      <div style={{padding: "14px 18px 16px"}}>
        {/* ROI Progress */}
        <div style={{marginBottom: 14}}>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6}}>
            <span style={{...TYPO.cardMeta, color: "rgba(255,255,255,0.6)", fontFamily: FONT}}>
              Membership Value
            </span>
            <span style={{...TYPO.cardBody, fontWeight: 700, color: isEarned ? GREEN : accentColor, fontFamily: FONT}}>
              {roiPct}%{isEarned ? " ✓" : ""}
            </span>
          </div>
          <div style={{height: 4, background: "rgba(255,255,255,0.15)", borderRadius: 2, overflow: "hidden"}}>
            <div style={{
              height: "100%",
              borderRadius: 2,
              width: roiPct + "%",
              background: isEarned ? GREEN : accentColor,
              transition: "width 0.4s ease",
            }}/>
          </div>
          <div style={{display: "flex", justifyContent: "space-between", marginTop: 6}}>
            <span style={{...TYPO.caption, color: "rgba(255,255,255,0.5)", fontFamily: FONT}}>
              {isEarned 
                ? "Paid off" + (paidOffFormatted ? " " + paidOffFormatted : "") + "!"
                : fmt(fee - totalSaved) + " to break even"}
            </span>
            <span style={{...TYPO.caption, color: accentColor, fontWeight: 600, fontFamily: FONT}}>
              {fmt(totalSaved)} saved
            </span>
          </div>
        </div>

        {/* Executive Cashback Row */}
        {isExecutive && (
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(212,175,55,0.08)",
            borderRadius: 8,
            padding: "10px 12px",
          }}>
            <div>
              <div style={{...TYPO.caption, color: "rgba(255,255,255,0.5)", marginBottom: 2, fontFamily: FONT}}>
                2% Reward
              </div>
              <div style={{...TYPO.statLarge, color: GOLD, fontFamily: FONT}}>
                {fmt(cashbackYTD)}
              </div>
            </div>
            <div style={{textAlign: "right"}}>
              <div style={{...TYPO.caption, color: "rgba(255,255,255,0.5)", marginBottom: 2, fontFamily: FONT}}>
                Projected
              </div>
              <div style={{...TYPO.body, fontWeight: 600, color: "#fff", fontFamily: FONT}}>
                {fmt(projectedAnnual)}
              </div>
            </div>
            <div style={{textAlign: "right"}}>
              <div style={{...TYPO.caption, color: "rgba(255,255,255,0.5)", marginBottom: 2, fontFamily: FONT}}>
                Check
              </div>
              <div style={{...TYPO.cardBody, fontWeight: 600, color: GOLD, fontFamily: FONT}}>
                {weeksToCheck}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
