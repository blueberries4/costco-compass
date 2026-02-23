import { useState, useMemo, useEffect } from "react";
import {
  AMBER,
  BG,
  BLUE,
  CARD,
  CAT_ICON,
  GOLD,
  GREEN,
  MEMBER,
  MUTED,
  RED,
  SOFT,
  TEXT,
} from "./constants";
import { tripsApi, wishlistApi, listApi } from "./api/mockApi";
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
import GasCard from "./components/GasCard";
import TripScoreBadge from "./components/TripScoreBadge";
import TripCard from "./components/TripCard";
import ListTab from "./components/ListTab";
import NudgeCard from "./components/NudgeCard";
import InsightsTab from "./components/InsightsTab";
import BottomNav from "./components/BottomNav";
import ReceiptScanModal from "./components/ReceiptScanModal";

export default function App() {
  const [trips, setTrips] = useState([]);
  const [wishlist, setWishlist] = useState([]);
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
        const [tripsRes, wishlistRes, listRes] = await Promise.all([
          tripsApi.getAll(),
          wishlistApi.getAll(),
          listApi.getAll(),
        ]);
        if (tripsRes.success) setTrips(tripsRes.data);
        if (wishlistRes.success) setWishlist(wishlistRes.data);
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

  /* ── GAS ── */
  const gasItems = useMemo(() =>
    trips.flatMap(t => t.items.filter(i => i.category === "Gas").map(i => ({...i, date: t.date})))
  , [trips]);

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

  /* ── CAT TOTALS ── */
  const catTotals = useMemo(() => {
    const m = {};
    allItems.forEach(i => { m[i.category] = (m[i.category] || 0) + i.amount; });
    return Object.keys(m).map(c => ({cat: c, total: m[c]})).filter(x => x.total > 0).sort((a,b) => b.total - a.total);
  }, [allItems]);

  /* ── HOUSEHOLD ── */
  const byMember = useMemo(() => MEMBER.household.map(m => ({
    name: m,
    trips: trips.filter(t => t.addedBy === m).length,
    spend: trips.filter(t => t.addedBy === m).reduce((s,t) => s + t.items.reduce((a,i) => a + i.amount, 0), 0),
  })), [trips]);

  /* ── CONTEXTUAL HOME STATE ── */
  const impulseRate = allItems.length ? Math.round((allItems.filter(i => !i.planned).length / allItems.length) * 100) : 0;
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
      <div style={{display:"flex", justifyContent:"center", minHeight:"100vh", background:"#D8D0C8"}}>
        <div style={{width:"100%", maxWidth:430, minHeight:"100vh", background:BG,
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:"0 0 48px rgba(0,0,0,0.16)"}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:40, marginBottom:12}}>🛒</div>
            <div style={{fontSize:14, fontWeight:600, color:TEXT, marginBottom:4}}>Loading your data...</div>
            <div style={{fontSize:11, color:MUTED}}>Syncing with Costco</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{display:"flex", justifyContent:"center", minHeight:"100vh", background:"#D8D0C8"}}>
      <div style={{width:"100%", maxWidth:430, minHeight:"100vh", background:BG,
        position:"relative", overflow:"hidden", boxShadow:"0 0 48px rgba(0,0,0,0.16)"}}>

        <div style={{overflowY:"auto", height:"100vh", paddingBottom:74, scrollbarWidth:"none"}}>

          {/* ══ HOME ═══════════════════════════════════════════ */}
          {tab === "home" && (
            <div key={`h-${animKey}`}>
              {/* Tight header */}
              <div style={{background:"linear-gradient(145deg,#FFF9F5,#FDEAEA)",
                padding:"24px 20px 14px", position:"relative", overflow:"hidden"}}>
                <div style={{position:"absolute", top:-28, right:-28, width:88, height:88,
                  borderRadius:"50%", background:`${RED}06`}}/>
                <div style={{position:"relative", display:"flex", justifyContent:"space-between", alignItems:"flex-end"}}>
                  <div>
                    <div style={{fontSize:9, color:MUTED, letterSpacing:"0.08em",
                      textTransform:"uppercase", marginBottom:3}}>
                      {MEMBER.household.join(" & ")} · {MEMBER.type}
                    </div>
                    <div style={{fontSize:22, fontWeight:700, color:TEXT,
                      fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:"0.3px", lineHeight:1}}>
                      Good {new Date().getHours() < 12 ? "morning" : "afternoon"} 👋
                    </div>
                  </div>
                  {/* Sync status */}
                  <div style={{display:"flex", alignItems:"center", gap:5,
                    background:GREEN+"12", borderRadius:20, padding:"4px 9px"}}>
                    <div style={{width:5, height:5, borderRadius:"50%", background:GREEN}}
                      className="pulse"/>
                    <span style={{fontSize:9, fontWeight:600, color:GREEN}}>Auto-synced</span>
                  </div>
                </div>
              </div>

              <div style={{padding:"12px 18px", display:"flex", flexDirection:"column", gap:10}}>

                {/* Contextual brief — changes based on state */}
                <HomeBrief/>

                {/* Membership + cashback — single card */}
                <MembershipCard
                  totalSaved={totalSavedAll} fee={MEMBER.fee}
                  cashbackYTD={cashbackYTD} projectedAnnual={projectedAnnual}
                  paidOffDate={paidOff}/>

                {/* Gas card — only calculable data */}
                {gasItems.length > 0 && <GasCard gasItems={gasItems} animDelay={0.1}/>}

                {/* Quick stats — no duplicate savings */}
                <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
                  {[
                    {label:"Last trip", val: daysSinceLast !== null ? `${daysSinceLast}d ago` : "—",
                     sub: lastTrip?.notes || "", col: daysSinceLast > 18 ? AMBER : GREEN},
                    {label:"Trips logged", val:`${trips.length}`,
                     sub:`${MEMBER.household.join(" & ")}`, col:BLUE},
                    {label:"Impulse rate", val:`${impulseRate}%`,
                     sub:`${allItems.filter(i => !i.planned).length} unplanned items`,
                     col: impulseRate > 40 ? RED : MUTED},
                    {label:"Cashback YTD", val:fmtShort(cashbackYTD),
                     sub:"Executive 2% + 4% gas", col:GOLD},
                  ].map((s, i) => (
                    <div key={s.label} className="lift" style={{background:CARD, borderRadius:13,
                      padding:"12px", boxShadow:"0 2px 6px rgba(0,0,0,0.05)",
                      animation:`fadeUp 0.28s ${0.18 + i * 0.06}s ease both`}}>
                      <div style={{fontSize:9, fontWeight:500, color:MUTED, textTransform:"uppercase",
                        letterSpacing:"0.07em", marginBottom:3}}>{s.label}</div>
                      <div style={{fontSize:18, fontWeight:700, color:s.col,
                        fontFamily:"'Barlow Condensed',sans-serif", lineHeight:1}}>{s.val}</div>
                      <div style={{fontSize:9, color:MUTED, marginTop:2, lineHeight:1.3}}>{s.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Trip list CTA if items exist */}
                {tripList.length > 0 && (
                  <div className="tap lift" onClick={() => setTab("list")}
                    style={{background:`${BLUE}0E`, border:`1px solid ${BLUE}18`,
                      borderRadius:14, padding:"12px 14px", display:"flex",
                      alignItems:"center", gap:10, cursor:"pointer",
                      animation:"fadeUp 0.28s 0.38s ease both"}}>
                    <span style={{fontSize:20}}>📋</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12, fontWeight:600, color:BLUE}}>
                        {tripList.length} item{tripList.length !== 1 ? "s" : ""} on your list
                      </div>
                      <div style={{fontSize:10, color:MUTED, marginTop:1}}>
                        {tripList.filter(i => i.checked).length} checked off · tap to review
                      </div>
                    </div>
                    <span style={{color:BLUE, fontSize:14}}>→</span>
                  </div>
                )}

                {/* Quick Add Suggestions */}
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
                  animDelay={0.4}
                />

              </div>
            </div>
          )}

          {/* ══ LIST ═══════════════════════════════════════════ */}
          {tab === "list" && (
            <ListTab
              staples={staples} trips={trips} wishlist={wishlist}
              setWishlist={setWishlist} list={tripList} setList={setTripList}
              animKey={animKey}/>
          )}

          {/* ══ TRIPS ══════════════════════════════════════════ */}
          {tab === "trips" && (
            <div key={`t-${animKey}`}>
              <div style={{background:"linear-gradient(145deg,#FFF9F5,#EEF4FF)",
                padding:"24px 20px 14px", position:"relative", overflow:"hidden"}}>
                <div style={{position:"absolute", top:-28, right:-28, width:88, height:88,
                  borderRadius:"50%", background:`${BLUE}07`}}/>
                <div style={{position:"relative", display:"flex", justifyContent:"space-between", alignItems:"flex-end"}}>
                  <div>
                    <div style={{fontSize:9, color:MUTED, letterSpacing:"0.08em",
                      textTransform:"uppercase", marginBottom:3}}>{trips.length} runs</div>
                    <div style={{fontSize:22, fontWeight:700, color:TEXT,
                      fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:"0.3px", lineHeight:1}}>
                      Trip History
                    </div>
                    <div style={{fontSize:10, color:MUTED, marginTop:3}}>
                      Auto-imported · tap to expand
                    </div>
                  </div>
                  {/* Manual fallback */}
                  <button className="tap" onClick={() => setShowScan(true)}
                    style={{background:BLUE+"12", color:BLUE, border:"none", borderRadius:20,
                      padding:"6px 12px", fontSize:11, fontWeight:600, cursor:"pointer",
                      fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                    📷 Add manually
                  </button>
                </div>
              </div>
              <div style={{padding:"12px 18px", display:"flex", flexDirection:"column", gap:8}}>
                {sortedTrips.map((t, i) => (
                  <TripCard key={t.id} trip={t} delay={i * 0.05}
                    onDelete={id => setTrips(p => p.filter(x => x.id !== id))}/>
                ))}
              </div>
            </div>
          )}

          {/* ══ INSIGHTS ═══════════════════════════════════════ */}
          {tab === "insights" && (
            <InsightsTab
              trips={trips} allItems={allItems} staples={staples}
              catTotals={catTotals} byMember={byMember}
              cashbackYTD={cashbackYTD} yearItems={yearItems}
              totalSaved={totalSaved} kirklandEst={kirklandEst}
              animKey={animKey}/>
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
