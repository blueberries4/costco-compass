import { useState } from "react";
import { Card, CardTitle } from "./atoms";
import {
  AMBER,
  BLUE,
  BORDER,
  CARD,
  CAT_COLOR,
  CAT_ICON,
  CATS,
  GREEN,
  MEMBER,
  MUTED,
  RED,
  SOFT,
  TEXT,
  WAREHOUSES,
  WAREHOUSE_STOCK,
} from "../constants";
import { relDate } from "../helpers";

export default function ListTab({staples, trips, wishlist, setWishlist, list, setList, animKey}) {
  const [newItem, setNewItem] = useState("");
  const [newCat, setNewCat] = useState("Groceries");
  const [wishOpen, setWishOpen] = useState(false);
  const [warehouse, setWarehouse] = useState(WAREHOUSES[0].id);
  const [showAddWish, setShowAddWish] = useState(false);
  const [nw, setNw] = useState({name:"", category:"Electronics", note:"", addedBy:MEMBER.household[0]});

  const checked = list.filter(i => i.checked).length;
  const total = list.length;

  const addToList = () => {
    if(!newItem.trim()) return;
    setList(p => [...p, {id:Date.now(), name:newItem.trim(), category:newCat, checked:false, source:"manual"}]);
    setNewItem("");
  };
  const addFromSuggestion = s => {
    if(list.find(i => i.name.toLowerCase() === s.name.toLowerCase())) return;
    setList(p => [...p, {id:Date.now(), name:s.name, category:s.category, checked:false, source:"suggested"}]);
  };
  const addFromWishlist = item => {
    if(list.find(i => i.name.toLowerCase() === item.name.toLowerCase())) return;
    setList(p => [...p, {id:Date.now(), name:item.name, category:item.category, checked:false, source:"wishlist"}]);
  };
  const saveToWishlist = s => {
    if(wishlist.find(i => i.name.toLowerCase() === s.name.toLowerCase())) return;
    setWishlist(p => [...p, {id:Date.now(), name:s.name, category:s.category, note:"", addedBy:MEMBER.household[0]}]);
  };
  const toggle = id => setList(p => p.map(i => i.id === id ? {...i, checked:!i.checked} : i));
  const remove = id => setList(p => p.filter(i => i.id !== id));
  const clearDone = () => setList(p => p.filter(i => !i.checked));
  const saveWish = () => {
    if(!nw.name.trim()) return;
    setWishlist(p => [...p, {id:Date.now(), ...nw, name:nw.name.trim()}]);
    setNw({name:"", category:"Electronics", note:"", addedBy:MEMBER.household[0]});
    setShowAddWish(false);
  };
  const removeWish = id => setWishlist(p => p.filter(i => i.id !== id));

  const stockBadge = name => {
    const s = WAREHOUSE_STOCK[name]?.[warehouse];
    if(!s) return null;
    if(s === "In Stock") return {label:"In Stock", col:GREEN};
    if(s === "Limited") return {label:"Limited", col:AMBER};
    return {label:"Out of Stock", col:RED};
  };

  return (
    <div key={`l-${animKey}`}>
      {/* Header */}
      <div style={{background:"linear-gradient(145deg,#F5F9FF,#EFF4FF)",
        padding:"42px 20px 14px", position:"relative", overflow:"hidden"}}>
        <div style={{position:"absolute", top:-28, right:-28, width:88, height:88,
          borderRadius:"50%", background:`${BLUE}07`}}/>
        <div style={{position:"relative", display:"flex", justifyContent:"space-between", alignItems:"flex-end"}}>
          <div>
            <div style={{fontSize:9, fontWeight:500, color:MUTED, letterSpacing:"0.08em", marginBottom:3,
              textTransform:"uppercase"}}>NEXT TRIP</div>
            <div style={{fontSize:22, fontWeight:700, color:TEXT,
              fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:"0.3px", lineHeight:1}}>Your List</div>
            {total > 0 && <div style={{fontSize:10, color:MUTED, marginTop:3}}>{checked}/{total} checked off</div>}
          </div>
          {total > 0 && (
            <div style={{width:44, height:44}}>
              <svg viewBox="0 0 36 36" style={{transform:"rotate(-90deg)"}}>
                <circle cx="18" cy="18" r="15" fill="none" stroke={SOFT} strokeWidth="3"/>
                <circle cx="18" cy="18" r="15" fill="none" stroke={BLUE} strokeWidth="3"
                  strokeDasharray={`${(checked/total)*94} 94`}
                  strokeLinecap="round"/>
              </svg>
            </div>
          )}
        </div>
      </div>

      <div style={{padding:"12px 18px", display:"flex", flexDirection:"column", gap:10}}>
        {/* Add item */}
        <div style={{display:"flex", gap:6}}>
          <input type="text" placeholder="Add item to list…" value={newItem}
            onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === "Enter" && addToList()}
            style={{flex:1, background:CARD, border:`1.5px solid ${BORDER}`, borderRadius:11,
              padding:"10px 13px", fontSize:13, color:TEXT, fontFamily:"'Plus Jakarta Sans',sans-serif"}}/>
          <select value={newCat} onChange={e => setNewCat(e.target.value)}
            style={{background:CARD, border:`1.5px solid ${BORDER}`, borderRadius:11, padding:"0 8px",
              fontSize:12, color:TEXT, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
            {CATS.map(c => <option key={c} value={c}>{CAT_ICON[c]} {c}</option>)}
          </select>
          <button className="tap" onClick={addToList}
            style={{background:RED, color:"#fff", border:"none", borderRadius:11, padding:"0 13px",
              fontSize:17, cursor:"pointer", flexShrink:0, boxShadow:`0 2px 8px ${RED}38`}}>+</button>
        </div>

        {/* Smart suggestions */}
        {staples.filter(s => s.duePct >= 65).length > 0 && (
          <Card animDelay={0.04}>
            <CardTitle sub="Based on your purchase history">🔮 Probably running low</CardTitle>
            {staples.filter(s => s.duePct >= 65).slice(0, 5).map((s, i) => {
              const onList = !!list.find(x => x.name.toLowerCase() === s.name.toLowerCase());
              const onWish = !!wishlist.find(x => x.name.toLowerCase() === s.name.toLowerCase());
              return (
                <div key={s.name} style={{display:"flex", alignItems:"center", gap:8,
                  padding:"7px 0", borderBottom: i < Math.min(staples.filter(x => x.duePct >= 65).length, 5) - 1 ? `1px solid ${BORDER}` : "none",
                  animation:`fadeUp 0.24s ${0.05 + i * 0.04}s ease both`}}>
                  <span style={{fontSize:15}}>{CAT_ICON[s.category]}</span>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:12, fontWeight:500, color:TEXT,
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{s.name}</div>
                    <div style={{fontSize:10, color:MUTED}}>{relDate(s.lastBought)} · every ~{s.avgGap}d</div>
                  </div>
                  <div style={{display:"flex", gap:4, flexShrink:0}}>
                    <button className="tap" onClick={() => addFromSuggestion(s)}
                      style={{background: onList ? GREEN+"14" : BLUE+"12", color: onList ? GREEN : BLUE,
                        border:"none", borderRadius:20, padding:"4px 8px", fontSize:10, fontWeight:600,
                        cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                      {onList ? "✓" : "+ List"}
                    </button>
                    {!onList && (
                      <button className="tap" onClick={() => saveToWishlist(s)}
                        style={{background: onWish ? "#8B5CF610" : SOFT,
                          color: onWish ? "#8B5CF6" : MUTED,
                          border:"none", borderRadius:20, padding:"4px 8px", fontSize:10,
                          cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                        {onWish ? "★" : "☆"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </Card>
        )}

        {/* Current list */}
        {list.length > 0 ? (
          <Card animDelay={0.08} style={{padding:0, overflow:"hidden"}}>
            <div style={{padding:"10px 14px 8px", borderBottom:`1px solid ${BORDER}`,
              display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <span style={{fontSize:11, color:MUTED}}>{total} item{total !== 1 ? "s" : ""}</span>
              {checked > 0 && (
                <button className="tap" onClick={clearDone}
                  style={{fontSize:10, color:MUTED, background:"none", border:`1px solid ${BORDER}`,
                    borderRadius:20, padding:"3px 9px", cursor:"pointer",
                    fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                  Clear done ({checked})
                </button>
              )}
            </div>
            {list.map((item, i) => {
              return (
                <div key={item.id} style={{display:"flex", alignItems:"center", gap:10,
                  padding:"10px 14px",
                  borderBottom: i < list.length - 1 ? `1px solid ${BORDER}` : "none",
                  background: item.checked ? GREEN+"04" : "transparent", transition:"background 0.2s"}}>
                  <input type="checkbox" checked={item.checked} onChange={() => toggle(item.id)}/>
                  <span style={{fontSize:14}}>{CAT_ICON[item.category]}</span>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:12, fontWeight:500,
                      color: item.checked ? MUTED : TEXT,
                      textDecoration: item.checked ? "line-through" : "none",
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
                      {item.name}
                    </div>
                    {item.source && item.source !== "manual" && (
                      <div style={{fontSize:9, color: item.source === "wishlist" ? "#8B5CF6" : BLUE, marginTop:1}}>
                        {item.source === "wishlist" ? "⭐ from wishlist" : "🔮 suggested"}
                      </div>
                    )}
                  </div>
                  <button className="tap" onClick={() => remove(item.id)}
                    style={{background:"none", border:"none", color:MUTED, fontSize:14,
                      cursor:"pointer", padding:"2px 5px"}}>✕</button>
                </div>
              );
            })}
          </Card>
        ) : (
          <div style={{textAlign:"center", padding:"24px 20px", color:MUTED,
            animation:"fadeUp 0.3s 0.1s ease both"}}>
            <div style={{fontSize:30, marginBottom:8}}>📋</div>
            <div style={{fontSize:13, fontWeight:500}}>Your list is empty</div>
            <div style={{fontSize:11, marginTop:3}}>Add items or accept a suggestion</div>
          </div>
        )}

        {/* Wishlist section */}
        <div style={{background:CARD, borderRadius:16, overflow:"hidden",
          boxShadow:"0 2px 8px rgba(0,0,0,0.05)", animation:"fadeUp 0.3s 0.12s ease both"}}>

          {/* Warehouse picker row */}
          <div style={{padding:"12px 14px 10px", borderBottom:`1px solid ${BORDER}`}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8}}>
              <div style={{fontSize:12, fontWeight:600, color:TEXT}}>⭐ Wishlist</div>
              <div style={{display:"flex", gap:5}}>
                <button className="tap" onClick={() => setShowAddWish(true)}
                  style={{background:RED+"12", color:RED, border:"none", borderRadius:20, padding:"3px 9px",
                    fontSize:10, fontWeight:600, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                  + Add
                </button>
                <button className="tap" onClick={() => setWishOpen(o => !o)}
                  style={{background:SOFT, border:"none", color:MUTED, borderRadius:20, padding:"3px 9px",
                    fontSize:10, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                  {wishOpen ? "Hide" : "Show all"}
                </button>
              </div>
            </div>
            {/* Warehouse toggle */}
            <div style={{display:"flex", gap:4}}>
              <span style={{fontSize:9, color:MUTED, marginRight:2, alignSelf:"center"}}>Stock at:</span>
              {WAREHOUSES.map(w => (
                <button key={w.id} className="tap" onClick={() => setWarehouse(w.id)}
                  style={{border:"none", cursor:"pointer", padding:"3px 8px", borderRadius:20, fontSize:10,
                    background: warehouse === w.id ? BLUE+"18" : SOFT,
                    color: warehouse === w.id ? BLUE : MUTED,
                    fontWeight: warehouse === w.id ? 600 : 400,
                    fontFamily:"'Plus Jakarta Sans',sans-serif", transition:"all 0.13s"}}>
                  {w.name}
                </button>
              ))}
            </div>
          </div>

          {/* Wishlist items */}
          {(wishOpen ? wishlist : wishlist.slice(0, 3)).map((item, i) => {
            const sb = stockBadge(item.name);
            const onList = !!list.find(x => x.name.toLowerCase() === item.name.toLowerCase());
            return (
              <div key={item.id} style={{display:"flex", alignItems:"center", gap:9,
                padding:"10px 14px", borderBottom:`1px solid ${BORDER}`,
                animation:`fadeUp 0.24s ${i * 0.04}s ease both`}}>
                <span style={{fontSize:15}}>{CAT_ICON[item.category]}</span>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:12, fontWeight:500, color:TEXT,
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{item.name}</div>
                  <div style={{display:"flex", gap:5, marginTop:2, alignItems:"center"}}>
                    {sb && <span style={{fontSize:9, fontWeight:600, color:sb.col,
                      background:sb.col+"12", padding:"1px 6px", borderRadius:20}}>{sb.label}</span>}
                    <span style={{fontSize:9, color:MUTED}}>
                      {item.addedBy === "Partner" ? "🙋‍♀️" : "🙋‍♂️"} {item.addedBy}
                    </span>
                  </div>
                  {item.note && <div style={{fontSize:10, color:MUTED, marginTop:1}}>"{item.note}"</div>}
                </div>
                <div style={{display:"flex", flexDirection:"column", gap:4, flexShrink:0}}>
                  <button className="tap" onClick={() => addFromWishlist(item)}
                    style={{background: onList ? GREEN+"14" : BLUE+"12", color: onList ? GREEN : BLUE,
                      border:"none", borderRadius:20, padding:"4px 8px", fontSize:10, fontWeight:600,
                      cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                    {onList ? "✓" : "+ Trip"}
                  </button>
                  <button className="tap" onClick={() => removeWish(item.id)}
                    style={{background:"none", border:"none", color:MUTED, fontSize:9,
                      cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif", padding:"1px"}}>
                    Remove
                  </button>
                </div>
              </div>
            );
          })}

          {wishlist.length === 0 && (
            <div style={{padding:"16px 14px", textAlign:"center", color:MUTED}}>
              <div style={{fontSize:11}}>Nothing saved yet — add items you want eventually</div>
            </div>
          )}

          {/* Add to wishlist form */}
          {showAddWish && (
            <div style={{padding:"12px 14px", borderTop:`1px solid ${BORDER}`,
              background:SOFT, display:"flex", flexDirection:"column", gap:7}}>
              <input type="text" placeholder="Item name" value={nw.name}
                onChange={e => setNw(p => ({...p, name:e.target.value}))}
                style={{width:"100%", background:CARD, border:`1.5px solid ${BORDER}`, borderRadius:10,
                  padding:"9px 12px", fontSize:12, color:TEXT, fontFamily:"'Plus Jakarta Sans',sans-serif"}}/>
              <input type="text" placeholder="Note (optional)" value={nw.note}
                onChange={e => setNw(p => ({...p, note:e.target.value}))}
                style={{width:"100%", background:CARD, border:`1.5px solid ${BORDER}`, borderRadius:10,
                  padding:"9px 12px", fontSize:12, color:TEXT, fontFamily:"'Plus Jakarta Sans',sans-serif"}}/>
              <div style={{display:"flex", gap:5, flexWrap:"wrap"}}>
                {CATS.filter(c => c !== "Gas").map(c => (
                  <button key={c} className="tap" onClick={() => setNw(p => ({...p, category:c}))}
                    style={{border:"none", cursor:"pointer", padding:"3px 8px", borderRadius:20, fontSize:10,
                      background: nw.category === c ? CAT_COLOR[c]+"20" : CARD,
                      color: nw.category === c ? CAT_COLOR[c] : MUTED,
                      fontFamily:"'Plus Jakarta Sans',sans-serif", transition:"all 0.12s"}}>
                    {CAT_ICON[c]} {c}
                  </button>
                ))}
              </div>
              <div style={{display:"flex", gap:6}}>
                <button className="tap" onClick={() => setShowAddWish(false)}
                  style={{flex:1, padding:"9px", background:CARD, border:`1px solid ${BORDER}`,
                    borderRadius:50, fontSize:12, color:MUTED, cursor:"pointer",
                    fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Cancel</button>
                <button className="tap" onClick={saveWish}
                  style={{flex:1, padding:"9px", background: nw.name.trim() ? RED : "#C5BDB5",
                    border:"none", borderRadius:50, fontSize:12, fontWeight:600, color:"#fff",
                    cursor: nw.name.trim() ? "pointer" : "default", fontFamily:"'Plus Jakarta Sans',sans-serif",
                    transition:"background 0.18s"}}>Save</button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
