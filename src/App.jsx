import { useState, useMemo, useEffect } from "react";
import {
  AMBER,
  BG,
  BLUE,
  CARD,
  CAT_ICON,
  DARK_BLUE,
  FONT,
  GOLD,
  GREEN,
  MEMBER,
  MUTED,
  RED,
  SOFT,
  TEXT,
  TYPO,
  BORDER,
} from "./constants";
import { tripsApi, listApi } from "./api/mockApi";
import {
  calcCashback,
  daysBetween,
  fmt,
  fmtShort,
  memberYear,
  relDate,
  today,
  tripScore,
} from "./helpers";
import { Pill } from "./components/atoms";
import MembershipCard from "./components/MembershipCard";
import TripScoreBadge from "./components/TripScoreBadge";
import TripCard from "./components/TripCard";
import ListTab from "./components/ListTab";
import NudgeCard from "./components/NudgeCard";
import BottomNav from "./components/BottomNav";
import ReceiptScanModal from "./components/ReceiptScanModal";
import SavingsTab from "./components/SavingsTab";

export default function App() {
  const [trips, setTrips] = useState([]);
  const [tripList, setTripList] = useState([]);
  const [tab, setTab] = useState("home");
  const [showScan, setShowScan] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [paidOff, setPaidOff] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch initial data from mock APIs
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [tripsRes, listRes] = await Promise.all([
          tripsApi.getAll(),
          listApi.getAll(),
        ]);
        if (tripsRes.success) setTrips(tripsRes.data);
        if (listRes.success) setTripList(listRes.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => setAnimKey(k => k + 1), [tab]);

  /* ── DERIVED ── */
  const allItems = useMemo(() => trips.flatMap(t => t.items), [trips]);
  const sortedTrips = useMemo(() => [...trips].sort((a,b) => b.date.localeCompare(a.date)), [trips]);
  const lastTrip = sortedTrips[0];
  const daysSinceLast = lastTrip ? daysBetween(lastTrip.date, today()) : null;

  /* ── SAVINGS ── */
  const totalSaved = useMemo(() => allItems.reduce((s,i) =>
    s + (i.retailPrice && i.retailPrice > i.amount ? i.retailPrice - i.amount : 0), 0), [allItems]);
  const kirklandEst = useMemo(() => allItems.filter(i => i.kirkland && !i.retailPrice)
    .reduce((s,i) => s + i.amount * 0.22, 0), [allItems]);
  const totalSavedAll = totalSaved + kirklandEst;

  /* ── PAID OFF ── */
  useEffect(() => {
    if(totalSavedAll >= MEMBER.fee && !paidOff) {
      let run = 0;
      for(const t of [...trips].sort((a,b) => a.date.localeCompare(b.date))) {
        run += t.items.reduce((s,i) => s + (i.retailPrice && i.retailPrice > i.amount ? i.retailPrice - i.amount : 0), 0);
        run += t.items.filter(i => i.kirkland && !i.retailPrice).reduce((s,i) => s + i.amount * 0.22, 0);
        if(run >= MEMBER.fee) { setPaidOff(t.date); break; }
      }
    }
  }, [totalSavedAll, paidOff, trips]);

  /* ── CASHBACK ── */
  const {start: yearStart, end: yearEnd} = memberYear();
  const yearItems = useMemo(() => trips.filter(t => t.date >= yearStart && t.date < yearEnd).flatMap(t => t.items), [trips, yearStart, yearEnd]);
  const cashbackYTD = useMemo(() => calcCashback(yearItems), [yearItems]);
  const yearDays = daysBetween(yearStart, yearEnd);
  const daysElapsed = Math.min(daysBetween(yearStart, today()), yearDays);
  const projectedAnnual = daysElapsed > 0 ? Math.min((cashbackYTD / daysElapsed) * yearDays, MEMBER.cashbackMax) : 0;

  /* ── STAPLES ── */
  const staples = useMemo(() => {
    const map = {};
    trips.forEach(t => t.items.forEach(i => {
      const k = i.name.trim().toLowerCase();
      if(!map[k]) map[k] = {name: i.name, category: i.category, kirkland: i.kirkland, dates: [], amounts: []};
      map[k].dates.push(t.date);
      map[k].amounts.push(i.amount);
    }));
    return Object.values(map).filter(s => s.dates.length >= 3).map(s => {
      const sorted = [...s.dates].sort();
      const gaps = [];
      for(let i = 1; i < sorted.length; i++) gaps.push(daysBetween(sorted[i-1], sorted[i]));
      const avgGap = Math.round(gaps.reduce((a,b) => a + b, 0) / gaps.length);
      const lastBought = sorted[sorted.length - 1];
      const daysSince = daysBetween(lastBought, today());
      const duePct = Math.min(Math.round((daysSince / avgGap) * 100), 130);
      return {...s, count: s.dates.length, avgGap, lastBought, daysSince, duePct,
        avgCost: s.amounts.reduce((a,b) => a + b, 0) / s.amounts.length};
    }).sort((a,b) => b.duePct - a.duePct);
  }, [trips]);

  /* ── CONTEXTUAL HOME STATE ── */
  const overdueStaples = staples.filter(s => s.duePct >= 80);
  const lastTripScore = lastTrip ? (lastTrip.tripScore ?? tripScore(lastTrip)) : null;

  const homeContext = useMemo(() => {
    if(daysSinceLast === null) return "empty";
    if(daysSinceLast <= 2) return "just_returned";
    if(daysSinceLast > 18) return "trip_due";
    if(overdueStaples.length >= 2) return "restock";
    return "normal";
  }, [daysSinceLast, overdueStaples]);

  const saveTrip = async (trip) => {
    const newTrip = { ...trip, tripScore: tripScore(trip) };
    const res = await tripsApi.create(newTrip);
    if (res.success) {
      setTrips(p => [...p, res.data]);
      await listApi.clearChecked();
      setTripList(p => p.filter(i => !i.checked));
    }
  };

  /* ── HOME CONTEXTUAL BRIEF ── */
  const HomeBrief = () => {
    if(homeContext === "just_returned") {
      const impulseCount = lastTrip?.items?.filter(i => !i.planned).length || 0;
      return (
        <div style={{background:`linear-gradient(135deg,${GREEN}14,${GREEN}06)`,
          border:`1px solid ${GREEN}20`, borderRadius:14, padding:"13px 15px",
          animation:"fadeUp 0.3s ease both"}}>
          <div style={{fontSize:12, fontWeight:600, color:GREEN, marginBottom:3}}>
            Welcome back from your trip ✓
          </div>
          <div style={{fontSize:11, color:MUTED, marginBottom:8}}>
            {lastTrip?.notes || "Costco run"} · {relDate(lastTrip?.date)}
          </div>
          {lastTripScore !== null && (
            <div style={{display:"flex", alignItems:"center", gap:8}}>
              <TripScoreBadge score={lastTripScore} size="lg"/>
              <div style={{fontSize:11, color:MUTED}}>
                {lastTripScore >= 85
                  ? `You stuck to your list — ${impulseCount === 0 ? "no impulse buys!" : `only ${impulseCount} impulse buy${impulseCount > 1 ? "s" : ""}.`}`
                  : lastTripScore >= 65
                  ? `Good run — ${impulseCount} impulse buy${impulseCount !== 1 ? "s" : ""} snuck in.`
                  : `${impulseCount} impulse buys this time — happens to everyone!`}
              </div>
            </div>
          )}
        </div>
      );
    }
    if(homeContext === "trip_due") return null;
    if(homeContext === "restock") {
      const mostOverdue = overdueStaples[0];
      return (
        <div style={{background:SOFT, borderRadius:14, padding:"13px 15px",
          animation:"fadeUp 0.3s ease both"}}>
          <div style={{fontSize:12, fontWeight:600, color:TEXT, marginBottom:4}}>
            🔮 You're probably out of {mostOverdue?.name?.split(" ")[0].toLowerCase()}
          </div>
          <div style={{fontSize:11, color:MUTED, marginBottom:10}}>
            You're {mostOverdue?.daysSince} days out and you usually restock at {mostOverdue?.avgGap}.
          </div>
          <div style={{display:"flex", flexDirection:"column", gap:6}}>
            {overdueStaples.slice(0, 3).map(s => (
              <div key={s.name} style={{display:"flex", alignItems:"center", gap:8}}>
                <span style={{fontSize:14}}>{CAT_ICON[s.category]}</span>
                <span style={{flex:1, fontSize:12, color:TEXT}}>{s.name}</span>
                <Pill label={s.duePct >= 100 ? "Overdue" : "Due soon"} col={s.duePct >= 100 ? RED : AMBER}/>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  /* ════ RENDER ═══════════════════════════════════════════════════ */
  if (loading) {
    return (
      <div style={{display:"flex", justifyContent:"center", minHeight:"100vh", background:SOFT}}>
        <div style={{width:"100%", maxWidth:430, minHeight:"100vh", background:BG,
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:"0 0 48px rgba(0,0,0,0.12)"}}>
          <div style={{textAlign:"center"}}>
            <div style={{width:40, height:40, border:`3px solid ${BORDER}`, borderTopColor:RED,
              borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 16px"}}/>
            <div style={{fontSize:15, fontWeight:600, color:TEXT}}>Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{display:"flex", justifyContent:"center", minHeight:"100vh", background:SOFT}}>
      <div style={{width:"100%", maxWidth:430, minHeight:"100vh", background:SOFT,
        position:"relative", overflow:"hidden", boxShadow:"0 0 48px rgba(0,0,0,0.10)"}}>

        <div style={{overflowY:"auto", height:"100vh", paddingBottom:80, scrollbarWidth:"none"}}>

          {/* ══ HOME ═══════════════════════════════════════════ */}
          {tab === "home" && (
            <div key={`h-${animKey}`}>
              {/* Costco-style blue header bar */}
              <div style={{background:BLUE, padding:"14px 16px", display:"flex", 
                justifyContent:"space-between", alignItems:"center"}}>
                <div style={{...TYPO.pageTitle, color:"#fff", fontFamily:FONT}}>
                  My Costco
                </div>
                <div style={{display:"flex", alignItems:"center", gap:16}}>
                  <span style={{fontSize:20, color:"#fff"}}>🔔</span>
                  <div style={{width:32, height:32, borderRadius:"50%", background:"rgba(255,255,255,0.2)",
                    display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", 
                    fontSize:14, fontWeight:600}}>
                    {MEMBER.household[0]?.charAt(0) || "U"}
                  </div>
                </div>
              </div>

              <div style={{padding:"12px 16px", display:"flex", flexDirection:"column", gap:10}}>

                {/* Contextual brief — changes based on state */}
                <HomeBrief/>

                {/* Membership ROI + Cashback — THE key value prop */}
                <MembershipCard
                  totalSaved={totalSavedAll} fee={MEMBER.fee}
                  cashbackYTD={cashbackYTD} projectedAnnual={projectedAnnual}
                  paidOffDate={paidOff}/>

                {/* Quick stats - simplified to 2 key metrics */}
                <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
                  <div className="lift" style={{background:"#fff", borderRadius:10,
                    padding:"14px", border:`1px solid ${BORDER}`,
                    animation:"fadeUp 0.25s 0.1s ease both"}}>
                    <div style={{...TYPO.cardMeta, color:MUTED, marginBottom:6, fontFamily:FONT}}>Last Trip</div>
                    <div style={{...TYPO.statLarge, color: daysSinceLast > 18 ? AMBER : GREEN,
                      fontFamily:FONT, lineHeight:1}}>
                      {daysSinceLast !== null ? `${daysSinceLast}d ago` : "—"}
                    </div>
                    <div style={{...TYPO.caption, color:MUTED, marginTop:4, fontFamily:FONT}}>{lastTrip?.notes || ""}</div>
                  </div>
                  <div className="lift" style={{background:"#fff", borderRadius:10,
                    padding:"14px", border:`1px solid ${BORDER}`,
                    animation:"fadeUp 0.25s 0.15s ease both"}}>
                    <div style={{...TYPO.cardMeta, color:MUTED, marginBottom:6, fontFamily:FONT}}>Cashback YTD</div>
                    <div style={{...TYPO.statLarge, color:GOLD,
                      fontFamily:FONT, lineHeight:1}}>{fmtShort(cashbackYTD)}</div>
                    <div style={{...TYPO.caption, color:MUTED, marginTop:4, fontFamily:FONT}}>Executive 2%</div>
                  </div>
                </div>

                {/* Trip list CTA if items exist */}
                {tripList.length > 0 && (
                  <div className="tap" onClick={() => setTab("list")}
                    style={{background:"#fff", border:`1px solid ${BORDER}`,
                      borderRadius:10, padding:"14px 16px", display:"flex",
                      alignItems:"center", gap:12, cursor:"pointer",
                      animation:"fadeUp 0.25s 0.2s ease both"}}>
                    <span style={{fontSize:22}}>📋</span>
                    <div style={{flex:1}}>
                      <div style={{...TYPO.cardTitle, color:TEXT, fontFamily:FONT}}>
                        Shopping List
                      </div>
                      <div style={{...TYPO.bodySmall, color:MUTED, marginTop:2, fontFamily:FONT}}>
                        {tripList.length} item{tripList.length !== 1 ? "s" : ""} · {tripList.filter(i => i.checked).length} checked
                      </div>
                    </div>
                    <span style={{...TYPO.sectionTitle, color:BLUE, fontFamily:FONT}}>›</span>
                  </div>
                )}

                {/* Smart Suggestions - staple prediction */}
                <NudgeCard
                  staples={staples}
                  allItems={allItems}
                  onAddToList={async (item) => {
                    const newItem = {
                      name: item.name,
                      category: item.category,
                      checked: false,
                      source: item.type || "nudge",
                    };
                    const res = await listApi.addItem(newItem);
                    if (res.success) {
                      setTripList(prev => [...prev, res.data]);
                    }
                  }}
                  animDelay={0.25}
                />

              </div>
            </div>
          )}

          {/* ══ LIST ═══════════════════════════════════════════ */}
          {tab === "list" && (
            <ListTab
              staples={staples} trips={trips}
              list={tripList} setList={setTripList}
              animKey={animKey}/>
          )}

          {/* ══ DEALS / SAVINGS EVENT ══════════════════════════ */}
          {tab === "deals" && (
            <SavingsTab
              animKey={animKey}
              list={tripList}
              setList={setTripList}
              onAddToList={async (item) => {
                const newItem = {
                  name: item.name,
                  category: item.category,
                  checked: false,
                  source: "deal",
                };
                const res = await listApi.addItem(newItem);
                if (res.success) {
                  setTripList(prev => [...prev, res.data]);
                }
              }}
            />
          )}

          {/* ══ TRIPS ══════════════════════════════════════════ */}
          {tab === "trips" && (
            <div key={`t-${animKey}`} style={{background:SOFT}}>
              {/* Blue header */}
              <div style={{background:BLUE, padding:"14px 16px", display:"flex", 
                justifyContent:"space-between", alignItems:"center"}}>
                <div style={{color:"#fff"}}>
                  <div style={{...TYPO.pageTitle, fontFamily:FONT}}>
                    Trip History
                  </div>
                  <div style={{...TYPO.pageSubtitle, opacity:0.85, marginTop:2, fontFamily:FONT}}>{trips.length} trips logged</div>
                </div>
                <button className="tap" onClick={() => setShowScan(true)}
                  style={{background:"rgba(255,255,255,0.2)", color:"#fff", border:"none", borderRadius:6,
                    padding:"8px 12px", ...TYPO.buttonMedium, cursor:"pointer",
                    fontFamily:FONT}}>
                  + Add
                </button>
              </div>
              <div style={{padding:"12px 16px", display:"flex", flexDirection:"column", gap:10}}>
                {sortedTrips.map((t, i) => (
                  <TripCard key={t.id} trip={t} delay={i * 0.05}
                    onDelete={id => setTrips(p => p.filter(x => x.id !== id))}/>
                ))}
              </div>
            </div>
          )}

        </div>

        <BottomNav tab={tab} setTab={setTab}/>
      </div>

      {showScan && (
        <ReceiptScanModal
          onParsed={items => {
            saveTrip({id: Date.now(), date: today(), notes:"Manual entry",
              addedBy: MEMBER.household[0], items});
            setShowScan(false);
          }}
          onClose={() => setShowScan(false)}/>
      )}
    </div>
  );
}
