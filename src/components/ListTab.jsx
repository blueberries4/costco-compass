import { useState, useEffect } from "react";
import {
  AMBER,
  BLUE,
  BORDER,
  CARD,
  CAT_ICON,
  CATS,
  FONT,
  GREEN,
  MUTED,
  RED,
  SOFT,
  TEXT,
  TYPO,
  WAREHOUSES,
  WAREHOUSE_STOCK,
} from "../constants";
import { relDate } from "../helpers";
import { listApi } from "../api/mockApi";

export default function ListTab({staples, trips, list, setList, animKey}) {
  const [newItem, setNewItem] = useState("");
  const [newCat, setNewCat] = useState("Groceries");
  const [warehouse, setWarehouse] = useState(WAREHOUSES[0].id);
  const [toast, setToast] = useState(null);

  // Auto-hide toast after 2 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const checked = list.filter(i => i.checked).length;
  const total = list.length;

  const addToList = async () => {
    if(!newItem.trim()) return;
    // Check if already in list
    if(list.find(i => i.name.toLowerCase() === newItem.trim().toLowerCase())) {
      setToast({ message: "Item already in list", type: "info" });
      return;
    }
    const item = {name:newItem.trim(), category:newCat, checked:false, source:"manual"};
    const res = await listApi.addItem(item);
    if(res.success) {
      setList(p => [...p, res.data]);
      setToast({ message: `Added ${newItem.trim()}`, type: "success" });
    }
    setNewItem("");
  };
  
  const addFromSuggestion = async (s) => {
    if(list.find(i => i.name.toLowerCase() === s.name.toLowerCase())) {
      setToast({ message: "Item already in list", type: "info" });
      return;
    }
    const item = {name:s.name, category:s.category, checked:false, source:"suggested"};
    const res = await listApi.addItem(item);
    if(res.success) {
      setList(p => [...p, res.data]);
      setToast({ message: `Added ${s.name}`, type: "success" });
    }
  };
  
  const toggle = async (id) => {
    const res = await listApi.toggleItem(id);
    if(res.success) setList(p => p.map(i => i.id === id ? res.data : i));
  };
  
  const remove = async (id) => {
    const res = await listApi.removeItem(id);
    if(res.success) setList(p => p.filter(i => i.id !== id));
  };
  
  const clearDone = async () => {
    const res = await listApi.clearChecked();
    if(res.success) setList(p => p.filter(i => !i.checked));
  };

  const stockBadge = name => {
    const s = WAREHOUSE_STOCK[name]?.[warehouse];
    if(!s) return null;
    if(s === "In Stock") return {label:"In Stock", col:GREEN};
    if(s === "Limited") return {label:"Limited", col:AMBER};
    return {label:"Out of Stock", col:RED};
  };

  const curWarehouse = WAREHOUSES.find(w => w.id === warehouse)?.name || "";
  const borderStyle = "1px solid " + BORDER;

  return (
    <div key={"l-" + animKey}>
      <div style={{background:BLUE, padding:"14px 16px"}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <div style={{color:"#fff"}}>
            <div style={{...TYPO.pageTitle, fontFamily:FONT}}>
              Shopping List
            </div>
          </div>
          {total > 0 && (
            <div style={{display:"flex", alignItems:"center", gap:10}}>
              <div style={{textAlign:"right", color:"#fff"}}>
                <div style={{...TYPO.statMedium, fontFamily:FONT}}>{checked}/{total}</div>
                <div style={{...TYPO.caption, opacity:0.8, fontFamily:FONT}}>items</div>
              </div>
              <div style={{position:"relative", width:40, height:40}}>
                <svg viewBox="0 0 36 36" style={{transform:"rotate(-90deg)", width:"100%", height:"100%"}}>
                  <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#fff" strokeWidth="3"
                    strokeDasharray={(checked/total)*94 + " 94"}
                    strokeLinecap="round"/>
                </svg>
                <div style={{position:"absolute", top:"50%", left:"50%", transform:"translate(-50%, -50%)",
                  ...TYPO.caption, fontWeight:600, color:"#fff", fontFamily:FONT}}>
                  {checked === total ? "✓" : Math.round((checked/total)*100)+"%"}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{padding:"12px 16px", display:"flex", flexDirection:"column", gap:10, background:SOFT}}>
        <div style={{display:"flex", gap:8}}>
          <input type="text" placeholder="Add item…" value={newItem}
            onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === "Enter" && addToList()}
            style={{flex:1, background:CARD, border:borderStyle, borderRadius:8,
              padding:"10px 12px", ...TYPO.body, color:TEXT, fontFamily:FONT}}/>
          <select value={newCat} onChange={e => setNewCat(e.target.value)}
            style={{background:CARD, border:borderStyle, borderRadius:8, padding:"0 10px",
              ...TYPO.cardBody, color:TEXT, cursor:"pointer", fontFamily:FONT}}>
            {CATS.map(c => <option key={c} value={c}>{CAT_ICON[c]} {c}</option>)}
          </select>
          <button className="tap" onClick={addToList}
            style={{background:RED, color:"#fff", border:"none", borderRadius:8, padding:"0 14px",
              fontSize:18, fontWeight:600, cursor:"pointer"}}>+</button>
        </div>

        <div style={{background:"#fff", borderRadius:8, padding:"10px 12px", border:borderStyle}}>
          <div style={{...TYPO.cardMeta, color:MUTED, marginBottom:6, fontFamily:FONT}}>Check stock at warehouse:</div>
          <div style={{display:"flex", gap:6}}>
            {WAREHOUSES.map(w => (
              <button key={w.id} className="tap" onClick={() => setWarehouse(w.id)}
                style={{border:"none", cursor:"pointer", padding:"6px 12px", borderRadius:6, 
                  ...TYPO.cardBody,
                  background: warehouse === w.id ? BLUE : "#F5F5F5",
                  color: warehouse === w.id ? "#fff" : MUTED,
                  fontWeight: warehouse === w.id ? 600 : 400,
                  fontFamily:FONT, transition:"all 0.15s"}}>
                {w.name}
              </button>
            ))}
          </div>
        </div>

        {staples.filter(s => s.duePct >= 65).length > 0 && (
          <div style={{background:"#fff", borderRadius:10, border:borderStyle, overflow:"hidden"}}>
            <div style={{padding:"12px 14px", borderBottom:borderStyle}}>
              <div style={{...TYPO.cardTitle, color:TEXT, fontFamily:FONT}}>🔮 Probably running low</div>
              <div style={{...TYPO.cardMeta, color:MUTED, marginTop:2, fontFamily:FONT}}>Based on your purchase history</div>
            </div>
            {staples.filter(s => s.duePct >= 65).slice(0, 4).map((s, i) => {
              const onList = !!list.find(x => x.name.toLowerCase() === s.name.toLowerCase());
              const cnt = staples.filter(x => x.duePct >= 65).length;
              return (
                <div key={s.name} style={{display:"flex", alignItems:"center", gap:10,
                  padding:"10px 14px",
                  borderBottom: i < Math.min(cnt, 4) - 1 ? borderStyle : "none"}}>
                  <span style={{fontSize:16}}>{CAT_ICON[s.category]}</span>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{...TYPO.cardBody, fontWeight:500, color:TEXT, fontFamily:FONT}}>{s.name}</div>
                    <div style={{...TYPO.cardMeta, color:MUTED, fontFamily:FONT}}>{relDate(s.lastBought)} · every ~{s.avgGap}d</div>
                  </div>
                  <button className="tap" onClick={() => addFromSuggestion(s)}
                    style={{background: onList ? GREEN : BLUE, color:"#fff",
                      border:"none", borderRadius:6, padding:"6px 12px", 
                      ...TYPO.cardMeta, fontWeight:600,
                      cursor:"pointer", fontFamily:FONT}}>
                    {onList ? "✓ Added" : "+ Add"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {list.length > 0 ? (
          <div style={{background:"#fff", borderRadius:10, border:borderStyle, overflow:"hidden"}}>
            <div style={{padding:"10px 14px", borderBottom:borderStyle,
              display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <span style={{...TYPO.cardBody, fontWeight:500, color:TEXT, fontFamily:FONT}}>Your List</span>
              {checked > 0 && (
                <button className="tap" onClick={clearDone}
                  style={{...TYPO.cardMeta, color:MUTED, background:"#F5F5F5", border:"none",
                    borderRadius:6, padding:"4px 10px", cursor:"pointer", fontFamily:FONT}}>
                  Clear done ({checked})
                </button>
              )}
            </div>
            {list.map((item, i) => {
              const sb = stockBadge(item.name);
              return (
                <div key={item.id} style={{display:"flex", alignItems:"center", gap:10,
                  padding:"12px 14px", borderBottom: i < list.length - 1 ? borderStyle : "none",
                  background: item.checked ? GREEN+"06" : "transparent", transition:"background 0.2s"}}>
                  <input type="checkbox" checked={item.checked} onChange={() => toggle(item.id)}
                    style={{width:20, height:20, cursor:"pointer"}}/>
                  <span style={{fontSize:16}}>{CAT_ICON[item.category]}</span>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{...TYPO.body, fontWeight:500, color: item.checked ? MUTED : TEXT, fontFamily:FONT,
                      textDecoration: item.checked ? "line-through" : "none"}}>{item.name}</div>
                    {sb && (
                      <div style={{marginTop:3}}>
                        <span style={{...TYPO.caption, fontWeight:600, color:sb.col,
                          background:sb.col+"12", padding:"2px 8px", borderRadius:4, fontFamily:FONT}}>
                          {sb.label} at {curWarehouse}
                        </span>
                      </div>
                    )}
                    {item.source && item.source !== "manual" && !sb && (
                      <div style={{...TYPO.caption, color:BLUE, marginTop:2, fontFamily:FONT}}>🔮 suggested</div>
                    )}
                  </div>
                  <button className="tap" onClick={() => remove(item.id)}
                    style={{background:"none", border:"none", color:MUTED, fontSize:16,
                      cursor:"pointer", padding:"4px"}}>✕</button>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{textAlign:"center", padding:"32px 20px", color:MUTED,
            background:"#fff", borderRadius:10, border:borderStyle}}>
            <div style={{fontSize:36, marginBottom:10}}>📋</div>
            <div style={{...TYPO.cardTitle, color:TEXT, fontFamily:FONT}}>Your list is empty</div>
            <div style={{...TYPO.cardBody, marginTop:4, color:MUTED, fontFamily:FONT}}>Add items above or accept suggestions</div>
          </div>
        )}
      </div>

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: "fixed",
          bottom: 90,
          left: "50%",
          transform: "translateX(-50%)",
          background: toast.type === "success" ? GREEN : BLUE,
          color: "#fff",
          padding: "12px 20px",
          borderRadius: 10,
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: 8,
          animation: "fadeUp 0.2s ease both",
          fontFamily: FONT,
          maxWidth: "85%",
        }}>
          <span style={{ fontSize: 16 }}>
            {toast.type === "success" ? "✓" : "ℹ"}
          </span>
          <span style={{ ...TYPO.cardBody, fontWeight: 600, fontFamily: FONT }}>
            {toast.message}
          </span>
        </div>
      )}
    </div>
  );
}
