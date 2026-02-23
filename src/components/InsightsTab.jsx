import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import PageHeader from "./PageHeader";
import { Card, CardTitle } from "./atoms";
import TripScoreBadge from "./TripScoreBadge";
import {
  AMBER,
  BLUE,
  BORDER,
  CARD,
  CAT_COLOR,
  CAT_ICON,
  GOLD,
  GREEN,
  MEMBER,
  MUTED,
  RED,
  SOFT,
  TEXT,
} from "../constants";
import { calcCashback, fmt, fmtShort, relDate, tripScore } from "../helpers";

export default function InsightsTab({trips, allItems, staples, catTotals, byMember,
  cashbackYTD, yearItems, totalSaved, kirklandEst, animKey}) {

  const sortedTrips = useMemo(() => [...trips].sort((a,b) => b.date.localeCompare(a.date)), [trips]);
  const impulseItems = useMemo(() => allItems.filter(i => !i.planned), [allItems]);
  const impulseSpend = useMemo(() => impulseItems.reduce((s,i) => s + i.amount, 0), [impulseItems]);
  const impulseRate = allItems.length ? Math.round((impulseItems.length / allItems.length) * 100) : 0;
  const totalSavedAll = totalSaved + kirklandEst;

  // Monthly spend data
  const monthlyData = useMemo(() => {
    const m = {};
    trips.forEach(t => {
      const key = t.date.slice(0, 7);
      if(!m[key]) m[key] = {month: key.slice(5), spend: 0, cashback: 0};
      m[key].spend += t.items.reduce((s,i) => s + i.amount, 0);
      m[key].cashback += calcCashback(t.items);
    });
    return Object.values(m).sort((a,b) => a.month.localeCompare(b.month))
      .map(r => ({...r, spend: parseFloat(r.spend.toFixed(2)), cashback: parseFloat(r.cashback.toFixed(2))}));
  }, [trips]);

  // Trip score trend
  const scoreTrend = useMemo(() => (
    [...trips].sort((a,b) => a.date.localeCompare(b.date)).map(t => ({
      label: t.date.slice(5),
      score: t.tripScore ?? tripScore(t),
    }))
  ), [trips]);

  // Best single purchase (most saved)
  const bestPurchase = useMemo(() => {
    const eligible = allItems.filter(i => i.retailPrice && i.retailPrice > i.amount);
    if(!eligible.length) return null;
    return eligible.reduce((best, i) =>
      (i.retailPrice - i.amount) > (best.retailPrice - best.amount) ? i : best);
  }, [allItems]);

  // Kirkland vs name brand count
  const kirklandCount = allItems.filter(i => i.kirkland).length;
  const kirklandPct = allItems.length ? Math.round((kirklandCount / allItems.length) * 100) : 0;

  // Cashback breakdown
  const cbBreakdown = [
    {label:"Non-gas purchases", rate:"2%",
     items: yearItems.filter(i => i.category !== "Gas"), rateVal: MEMBER.cashbackRate, col: GOLD},
    {label:"Gas purchases", rate:"4%",
     items: yearItems.filter(i => i.category === "Gas"), rateVal: MEMBER.gasCashbackRate, col: RED},
  ];

  return (
    <div key={`i-${animKey}`}>
      <PageHeader
        left={{eyebrow:"since you joined", title:"Insights", sub:"What your data actually says"}}
        gradient="linear-gradient(145deg,#FFF9F5,#F5F0FF)"/>

      <div style={{padding:"12px 18px", display:"flex", flexDirection:"column", gap:10}}>

        {/* 1. Aha moments row */}
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
          {[
            {icon:"💰", label:"Total saved", val:fmtShort(totalSavedAll), sub:"vs retail prices", col:GREEN},
            {icon:"⚡", label:"Impulse spend", val:fmtShort(impulseSpend), sub:`${impulseRate}% of items`, col:RED},
            {icon:"🟣", label:"Kirkland %", val:`${kirklandPct}%`, sub:`${kirklandCount} items`, col:"#8B5CF6"},
            {icon:"📅", label:"Avg trip spend", val:fmtShort(trips.length ? trips.reduce((s,t) => s + t.items.reduce((a,i) => a + i.amount, 0), 0) / trips.length : 0),
              sub:`${trips.length} trips`, col:BLUE},
          ].map((s, i) => (
            <div key={s.label} className="lift" style={{background:CARD, borderRadius:14, padding:"12px",
              boxShadow:"0 2px 6px rgba(0,0,0,0.04)", animation:`fadeUp 0.28s ${i * 0.05}s ease both`}}>
              <div style={{fontSize:16, marginBottom:4}}>{s.icon}</div>
              <div style={{fontSize:9, fontWeight:500, color:MUTED, textTransform:"uppercase",
                letterSpacing:"0.07em", marginBottom:3}}>{s.label}</div>
              <div style={{fontSize:18, fontWeight:700, color:s.col,
                fontFamily:"'Barlow Condensed',sans-serif", lineHeight:1}}>{s.val}</div>
              <div style={{fontSize:9, color:MUTED, marginTop:2}}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* 2. Best purchase */}
        {bestPurchase && (
          <Card animDelay={0.1} style={{background:`linear-gradient(135deg,${GREEN}10,${GREEN}05)`,
            border:`1px solid ${GREEN}20`}}>
            <div style={{display:"flex", alignItems:"center", gap:10}}>
              <div style={{width:36, height:36, borderRadius:10, background:GREEN+"18",
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:20}}>🏆</div>
              <div style={{flex:1}}>
                <div style={{fontSize:10, fontWeight:500, color:GREEN, textTransform:"uppercase",
                  letterSpacing:"0.07em", marginBottom:2}}>Best purchase</div>
                <div style={{fontSize:13, fontWeight:600, color:TEXT}}>{bestPurchase.name}</div>
                <div style={{fontSize:11, color:MUTED}}>
                  Paid {fmt(bestPurchase.amount)} · saved {fmt(bestPurchase.retailPrice - bestPurchase.amount)} vs retail
                </div>
              </div>
              <div style={{fontSize:20, fontWeight:700, color:GREEN,
                fontFamily:"'Barlow Condensed',sans-serif"}}>{fmt(bestPurchase.retailPrice - bestPurchase.amount)}</div>
            </div>
          </Card>
        )}

        {/* 3. Executive cashback breakdown */}
        {MEMBER.type === "Executive" && (
          <Card animDelay={0.14}>
            <CardTitle sub="Current membership year">Executive Cashback</CardTitle>
            {cbBreakdown.map(r => {
              const spend = r.items.reduce((s,i) => s + i.amount, 0);
              const cb = r.items.reduce((s,i) => s + i.amount * r.rateVal, 0);
              return (
                <div key={r.label} style={{display:"flex", justifyContent:"space-between",
                  alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${BORDER}`}}>
                  <div>
                    <div style={{fontSize:12, fontWeight:500, color:TEXT}}>{r.label}</div>
                    <div style={{fontSize:10, color:MUTED}}>{r.rate} · {fmt(spend)} spent</div>
                  </div>
                  <div style={{fontSize:13, fontWeight:600, color:r.col, fontFamily:"'DM Mono',monospace"}}>
                    +{fmt(cb)}
                  </div>
                </div>
              );
            })}
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:8}}>
              <span style={{fontSize:12, fontWeight:600, color:TEXT}}>Total earned</span>
              <span style={{fontSize:15, fontWeight:700, color:GOLD,
                fontFamily:"'Barlow Condensed',sans-serif"}}>{fmt(cashbackYTD)}</span>
            </div>
          </Card>
        )}

        {/* 4. Trip score trend */}
        {scoreTrend.length >= 2 && (
          <Card animDelay={0.18}>
            <CardTitle sub="Higher = more planned, more savings">Trip Score Trend</CardTitle>
            <ResponsiveContainer width="100%" height={80}>
              <LineChart data={scoreTrend}>
                <XAxis dataKey="label" tick={{fill:MUTED, fontSize:9}} axisLine={false} tickLine={false}/>
                <YAxis hide domain={[0, 100]}/>
                <Tooltip contentStyle={{background:CARD, border:"none", borderRadius:8,
                  boxShadow:"0 2px 10px rgba(0,0,0,0.08)", fontSize:11}}
                  formatter={v => [`${v}/100`, "Score"]}/>
                <Line type="monotone" dataKey="score" stroke={BLUE} strokeWidth={2}
                  dot={{fill:BLUE, r:3, strokeWidth:0}}
                  activeDot={{r:5, fill:BLUE}}/>
              </LineChart>
            </ResponsiveContainer>
            <div style={{display:"flex", gap:8, marginTop:8, flexWrap:"wrap"}}>
              {scoreTrend.map((s, i) => (
                <div key={i} style={{display:"flex", alignItems:"center", gap:4}}>
                  <TripScoreBadge score={s.score}/>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* 5. Monthly spend chart */}
        {monthlyData.length >= 2 && (
          <Card animDelay={0.22}>
            <CardTitle sub="Monthly spend vs cashback earned">Spend by Month</CardTitle>
            <ResponsiveContainer width="100%" height={90}>
              <BarChart data={monthlyData} barSize={16}>
                <XAxis dataKey="month" tick={{fill:MUTED, fontSize:9}} axisLine={false} tickLine={false}/>
                <YAxis hide/>
                <Tooltip contentStyle={{background:CARD, border:"none", borderRadius:8,
                  boxShadow:"0 2px 10px rgba(0,0,0,0.08)", fontSize:11}}
                  formatter={(v, n) => [fmt(v), n === "spend" ? "Spent" : "Cashback"]}/>
                <Bar dataKey="spend" fill={RED} opacity={0.72} radius={[3,3,0,0]}/>
                <Bar dataKey="cashback" fill={GOLD} opacity={0.85} radius={[3,3,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
            <div style={{display:"flex", gap:12, marginTop:6, fontSize:10, color:MUTED}}>
              <span><span style={{color:RED}}>■</span> Spend</span>
              <span><span style={{color:GOLD}}>■</span> Cashback</span>
            </div>
          </Card>
        )}

        {/* 6. Impulse analysis */}
        <Card animDelay={0.26}>
          <CardTitle sub={`${impulseRate}% of all items were unplanned`}>Impulse Spending</CardTitle>
          <div style={{display:"flex", gap:14, marginBottom:12}}>
            <div>
              <div style={{fontSize:22, fontWeight:700, color:RED,
                fontFamily:"'Barlow Condensed',sans-serif"}}>{fmt(impulseSpend)}</div>
              <div style={{fontSize:9, color:MUTED}}>total unplanned</div>
            </div>
            <div>
              <div style={{fontSize:22, fontWeight:700, color:MUTED,
                fontFamily:"'Barlow Condensed',sans-serif"}}>{impulseItems.length}</div>
              <div style={{fontSize:9, color:MUTED}}>impulse items</div>
            </div>
            <div>
              <div style={{fontSize:22, fontWeight:700, color:AMBER,
                fontFamily:"'Barlow Condensed',sans-serif"}}>
                {trips.length ? fmt(impulseSpend / trips.length).replace("$", "$") : "—"}
              </div>
              <div style={{fontSize:9, color:MUTED}}>per trip avg</div>
            </div>
          </div>
          {sortedTrips.slice(0, 5).map((t, i) => {
            const imp = t.items.filter(x => !x.planned).length;
            const pct = Math.round((imp / Math.max(t.items.length, 1)) * 100);
            return (
              <div key={t.id} style={{marginBottom:8}}>
                <div style={{display:"flex", justifyContent:"space-between", marginBottom:2, fontSize:10}}>
                  <span style={{color:TEXT}}>{relDate(t.date)} · {t.notes || "run"}</span>
                  <span style={{color: pct > 40 ? RED : pct > 20 ? AMBER : GREEN, fontWeight:500}}>{pct}%</span>
                </div>
                <div style={{height:3, background:SOFT, borderRadius:2, overflow:"hidden"}}>
                  <div className="fbar" style={{height:"100%", borderRadius:2,
                    width:`${pct}%`, background: pct > 40 ? RED : pct > 20 ? AMBER : GREEN,
                    animationDelay:`${0.28 + i * 0.04}s`}}/>
                </div>
              </div>
            );
          })}
        </Card>

        {/* 7. Category breakdown */}
        <Card animDelay={0.3}>
          <CardTitle sub="All-time spend by category">Where You Spend</CardTitle>
          {catTotals.map((c, i) => {
            const maxT = catTotals[0]?.total || 1;
            return (
              <div key={c.cat} style={{marginBottom:9}}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3}}>
                  <div style={{display:"flex", alignItems:"center", gap:6}}>
                    <span style={{fontSize:12}}>{CAT_ICON[c.cat]}</span>
                    <span style={{fontSize:12, fontWeight:500, color:TEXT}}>{c.cat}</span>
                  </div>
                  <span style={{fontSize:11, fontWeight:500, color:TEXT,
                    fontFamily:"'DM Mono',monospace"}}>{fmt(c.total)}</span>
                </div>
                <div style={{height:3, background:SOFT, borderRadius:2, overflow:"hidden"}}>
                  <div className="fbar" style={{height:"100%", borderRadius:2,
                    width:`${(c.total / maxT) * 100}%`, background:CAT_COLOR[c.cat],
                    animationDelay:`${0.32 + i * 0.04}s`}}/>
                </div>
              </div>
            );
          })}
        </Card>

        {/* 8. Household */}
        <Card animDelay={0.34}>
          <CardTitle sub="Who went, who spent">Household</CardTitle>
          {byMember.map((m, i) => {
            const totalSpend = trips.reduce((s,t) => s + t.items.reduce((a,x) => a + x.amount, 0), 0);
            const pct = totalSpend > 0 ? Math.round((m.spend / totalSpend) * 100) : 0;
            return (
              <div key={m.name} style={{marginBottom: i < byMember.length - 1 ? 11 : 0}}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4}}>
                  <div style={{display:"flex", alignItems:"center", gap:7}}>
                    <span style={{fontSize:15}}>{i === 0 ? "🙋‍♂️" : "🙋‍♀️"}</span>
                    <div>
                      <div style={{fontSize:12, fontWeight:500, color:TEXT}}>{m.name}</div>
                      <div style={{fontSize:10, color:MUTED}}>{m.trips} trip{m.trips !== 1 ? "s" : ""}</div>
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:12, fontWeight:500, color:TEXT,
                      fontFamily:"'DM Mono',monospace"}}>{fmt(m.spend)}</div>
                    <div style={{fontSize:9, color:MUTED}}>{pct}%</div>
                  </div>
                </div>
                <div style={{height:3, background:SOFT, borderRadius:2, overflow:"hidden"}}>
                  <div className="fbar" style={{height:"100%", borderRadius:2,
                    width:`${pct}%`, background: i === 0 ? BLUE : RED,
                    animationDelay:`${0.36 + i * 0.07}s`}}/>
                </div>
              </div>
            );
          })}
        </Card>

        {/* 9. Savings breakdown */}
        <Card animDelay={0.38}>
          <CardTitle sub="How you're beating retail">Savings Breakdown</CardTitle>
          {[
            {icon:"🏷", label:"Tracked savings", val:totalSaved, col:GREEN, sub:"items with retail price logged"},
            {icon:"🟣", label:"Kirkland est.", val:kirklandEst, col:"#8B5CF6", sub:"~22% vs name brand (est.)"},
            {icon:"💰", label:"Total saved", val:totalSavedAll, col:RED, sub:"vs membership fee of " + fmt(MEMBER.fee)},
          ].map((r, i) => (
            <div key={r.label} style={{display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"8px 0", borderBottom: i < 2 ? `1px solid ${BORDER}` : "none"}}>
              <div style={{display:"flex", alignItems:"center", gap:8}}>
                <div style={{width:28, height:28, borderRadius:8, background:r.col+"12",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:13}}>
                  {r.icon}
                </div>
                <div>
                  <div style={{fontSize:12, fontWeight:500, color:TEXT}}>{r.label}</div>
                  <div style={{fontSize:9, color:MUTED}}>{r.sub}</div>
                </div>
              </div>
              <div style={{fontSize:12, fontWeight:600, color:r.col, fontFamily:"'DM Mono',monospace"}}>
                {fmt(r.val)}
              </div>
            </div>
          ))}
        </Card>

      </div>
    </div>
  );
}
