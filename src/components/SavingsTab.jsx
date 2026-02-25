import { useState, useMemo, useEffect } from "react";
import {
  BLUE,
  BORDER,
  FONT,
  GREEN,
  MUTED,
  RED,
  SOFT,
  TEXT,
  TYPO,
  GOLD,
  CAT_ICON,
} from "../constants";

// Mock savings event data - simulating the Costco coupon book
const SAVINGS_EVENT = {
  title: "March Savings Event",
  validStart: "2026-03-02",
  validEnd: "2026-03-29",
  categories: [
    { id: "featured", name: "Featured", icon: "⭐" },
    { id: "groceries", name: "Groceries", icon: "🛒" },
    { id: "household", name: "Household", icon: "🏠" },
    { id: "health", name: "Health & Beauty", icon: "💊" },
    { id: "electronics", name: "Electronics", icon: "📱" },
    { id: "clothing", name: "Clothing", icon: "👕" },
  ],
  deals: [
    // Featured
    { id: 1, category: "featured", name: "Kirkland Signature Olive Oil", description: "2L, Extra Virgin, First Cold Press", originalPrice: 18.99, savings: 4.00, limit: 2, itemNum: "1234567", buyerPick: true },
    { id: 2, category: "featured", name: "Bibigo Beef Bulgogi Mandu", description: "48 oz, Frozen Dumplings", originalPrice: 15.99, savings: 4.50, limit: 3, itemNum: "2345678" },
    { id: 3, category: "featured", name: "Tide Pods Laundry Detergent", description: "152 ct, Spring Meadow", originalPrice: 34.99, savings: 7.00, limit: 2, itemNum: "3456789" },
    // Groceries
    { id: 4, category: "groceries", name: "Kirkland Signature Bacon", description: "4 x 1 lb, Thick Cut", originalPrice: 19.99, savings: 4.00, limit: 2, itemNum: "4567890" },
    { id: 5, category: "groceries", name: "Organic Valley Milk", description: "3 x 64 oz, Whole Milk", originalPrice: 14.99, savings: 3.00, limit: 3, itemNum: "5678901" },
    { id: 6, category: "groceries", name: "Tillamook Cheese", description: "2.5 lb, Medium Cheddar", originalPrice: 13.99, savings: 3.50, limit: 2, itemNum: "6789012" },
    { id: 7, category: "groceries", name: "Ling Ling Potstickers", description: "67.2 oz, Chicken & Vegetable", originalPrice: 14.99, savings: 4.00, limit: 3, itemNum: "7890123", buyerPick: true },
    { id: 8, category: "groceries", name: "Mila Soup Dumplings", description: "36 oz, Pork & Chicken", originalPrice: 13.99, savings: 3.00, limit: 2, itemNum: "8901234" },
    { id: 9, category: "groceries", name: "Starbucks French Roast", description: "2.5 lb, Whole Bean", originalPrice: 24.99, savings: 5.00, limit: 2, itemNum: "9012345" },
    // Household
    { id: 10, category: "household", name: "Bounty Paper Towels", description: "12 Mega Rolls", originalPrice: 29.99, savings: 6.00, limit: 2, itemNum: "1122334" },
    { id: 11, category: "household", name: "Kirkland Signature Trash Bags", description: "200 ct, 13 Gallon", originalPrice: 18.99, savings: 4.00, limit: 2, itemNum: "2233445" },
    { id: 12, category: "household", name: "Clorox Disinfecting Wipes", description: "5 pk, 85 ct each", originalPrice: 21.99, savings: 5.00, limit: 3, itemNum: "3344556" },
    { id: 13, category: "household", name: "Rubbermaid WaveBrake Mop", description: "Commercial Grade", originalPrice: 89.99, savings: 20.00, limit: 1, itemNum: "4455667", buyerPick: true },
    // Health
    { id: 14, category: "health", name: "Kirkland Signature Vitamin D3", description: "600 softgels, 2000 IU", originalPrice: 14.99, savings: 3.50, limit: 3, itemNum: "5566778" },
    { id: 15, category: "health", name: "Olay Regenerist Moisturizer", description: "2 x 1.7 oz", originalPrice: 44.99, savings: 10.00, limit: 2, itemNum: "6677889" },
    { id: 16, category: "health", name: "Oral-B Electric Toothbrush", description: "2-Pack, Pro 1000", originalPrice: 79.99, savings: 20.00, limit: 1, itemNum: "7788990" },
    // Electronics
    { id: 17, category: "electronics", name: "Apple AirPods Pro", description: "2nd Generation", originalPrice: 249.99, savings: 50.00, limit: 1, itemNum: "8899001" },
    { id: 18, category: "electronics", name: "Samsung 65\" QLED TV", description: "4K Smart TV, Q60C", originalPrice: 899.99, savings: 150.00, limit: 1, itemNum: "9900112" },
    { id: 19, category: "electronics", name: "Dyson V15 Vacuum", description: "Cordless Stick Vacuum", originalPrice: 649.99, savings: 100.00, limit: 1, itemNum: "1011121", buyerPick: true },
    // Clothing
    { id: 20, category: "clothing", name: "Kirkland Signature Jeans", description: "Men's Relaxed Fit", originalPrice: 16.99, savings: 4.00, limit: 4, itemNum: "2122232" },
    { id: 21, category: "clothing", name: "32 Degrees Puffer Jacket", description: "Women's Lightweight", originalPrice: 24.99, savings: 7.00, limit: 2, itemNum: "3233343" },
    { id: 22, category: "clothing", name: "Adidas Athletic Socks", description: "6-Pack, Crew", originalPrice: 15.99, savings: 4.00, limit: 3, itemNum: "4344454" },
  ],
};

export default function SavingsTab({ animKey, list, setList, onAddToList }) {
  const [selectedCategory, setSelectedCategory] = useState("featured");
  const [savedDeals, setSavedDeals] = useState(new Set());
  const [toast, setToast] = useState(null);
  const [addedDeals, setAddedDeals] = useState(new Set());

  // Auto-hide toast after 2 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Track items already in list
  const itemsInList = useMemo(() => {
    return new Set(list?.map(i => i.name.toLowerCase()) || []);
  }, [list]);

  const filteredDeals = useMemo(() => {
    return SAVINGS_EVENT.deals.filter(d => d.category === selectedCategory);
  }, [selectedCategory]);

  const daysRemaining = useMemo(() => {
    const end = new Date(SAVINGS_EVENT.validEnd);
    const today = new Date();
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }, []);

  const toggleSave = (dealId) => {
    setSavedDeals(prev => {
      const next = new Set(prev);
      if (next.has(dealId)) {
        next.delete(dealId);
      } else {
        next.add(dealId);
      }
      return next;
    });
  };

  const addDealToList = async (deal) => {
    // Check if already in list
    if (itemsInList.has(deal.name.toLowerCase()) || addedDeals.has(deal.id)) {
      setToast({ message: `${deal.name} already in list`, type: "info" });
      return;
    }
    
    if (onAddToList) {
      await onAddToList({
        name: deal.name,
        category: selectedCategory === "groceries" ? "Groceries" : 
                  selectedCategory === "household" ? "Household" :
                  selectedCategory === "health" ? "Health" :
                  selectedCategory === "electronics" ? "Electronics" :
                  selectedCategory === "clothing" ? "Clothing" : "Other",
        type: "deal",
      });
      setAddedDeals(prev => new Set(prev).add(deal.id));
      setToast({ message: `Added ${deal.name}`, type: "success" });
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div key={"s-" + animKey} style={{ fontFamily: FONT }}>
      {/* Header - Mobile optimized with larger touch targets */}
      <div style={{
        background: "linear-gradient(145deg, " + RED + " 0%, #b8102d 100%)",
        padding: "20px 16px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative elements */}
        <div style={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
        }}/>
        <div style={{
          position: "absolute",
          bottom: -40,
          left: 30,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
        }}/>
        
        <div style={{ position: "relative" }}>
          <div style={{
            ...TYPO.cardMeta,
            color: "rgba(255,255,255,0.75)",
            letterSpacing: 1.2,
            textTransform: "uppercase",
            marginBottom: 6,
            fontFamily: FONT,
          }}>
            Member-Only Savings
          </div>
          <div style={{
            ...TYPO.pageTitle,
            color: "#fff",
            fontFamily: FONT,
            marginBottom: 8,
            lineHeight: 1.1,
          }}>
            {SAVINGS_EVENT.title}
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}>
            <span style={{
              ...TYPO.cardBody,
              color: "rgba(255,255,255,0.9)",
              fontFamily: FONT,
            }}>
              {formatDate(SAVINGS_EVENT.validStart)} – {formatDate(SAVINGS_EVENT.validEnd)}
            </span>
            {daysRemaining <= 7 && daysRemaining > 0 && (
              <span style={{
                ...TYPO.cardMeta,
                fontWeight: 700,
                color: "#fff",
                background: "rgba(0,0,0,0.3)",
                padding: "4px 10px",
                borderRadius: 12,
                fontFamily: FONT,
              }}>
                {daysRemaining} days left!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Category Pills - Horizontal scroll, large touch targets */}
      <div style={{
        padding: "14px 16px",
        background: "#fff",
        borderBottom: "1px solid " + BORDER,
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}>
        <div style={{
          display: "flex",
          gap: 10,
          minWidth: "max-content",
        }}>
          {SAVINGS_EVENT.categories.map(cat => (
            <button
              key={cat.id}
              className="tap"
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                border: "none",
                borderRadius: 24,
                padding: "10px 16px",
                ...TYPO.cardBody,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: selectedCategory === cat.id ? BLUE : "#F0F0F0",
                color: selectedCategory === cat.id ? "#fff" : TEXT,
                transition: "all 0.15s ease",
                fontFamily: FONT,
                minHeight: 44,
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <span style={{ fontSize: 16 }}>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Deals List - Mobile optimized cards */}
      <div style={{
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        background: SOFT,
        minHeight: "50vh",
      }}>
        {filteredDeals.map((deal, i) => {
          const isSaved = savedDeals.has(deal.id);
          const salePrice = deal.originalPrice - deal.savings;
          
          return (
            <div
              key={deal.id}
              style={{
                background: "#fff",
                borderRadius: 14,
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                animation: "fadeUp 0.25s " + (i * 0.04) + "s ease both",
              }}
            >
              {/* Deal Content */}
              <div style={{ padding: "16px" }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {deal.buyerPick && (
                      <div style={{
                        ...TYPO.badge,
                        fontWeight: 800,
                        color: GOLD,
                        background: GOLD + "18",
                        padding: "3px 8px",
                        borderRadius: 4,
                        display: "inline-block",
                        marginBottom: 6,
                        letterSpacing: 0.3,
                        fontFamily: FONT,
                      }}>
                        ★ BUYER'S PICK
                      </div>
                    )}
                    <div style={{
                      ...TYPO.cardTitle,
                      color: TEXT,
                      lineHeight: 1.25,
                      fontFamily: FONT,
                    }}>
                      {deal.name}
                    </div>
                    <div style={{
                      ...TYPO.cardBody,
                      color: MUTED,
                      marginTop: 4,
                      lineHeight: 1.3,
                      fontFamily: FONT,
                    }}>
                      {deal.description}
                    </div>
                  </div>
                  
                  {/* Save button - 44px touch target */}
                  <button
                    className="tap"
                    onClick={() => toggleSave(deal.id)}
                    style={{
                      border: "none",
                      background: isSaved ? RED + "15" : "#F5F5F5",
                      borderRadius: 10,
                      width: 44,
                      height: 44,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    <span style={{ fontSize: 20 }}>
                      {isSaved ? "❤️" : "🤍"}
                    </span>
                  </button>
                </div>
                
                {/* Price Section - Large, scannable */}
                <div style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 10,
                  marginTop: 14,
                  flexWrap: "wrap",
                }}>
                  <div style={{
                    ...TYPO.statLarge,
                    color: RED,
                    fontFamily: FONT,
                    lineHeight: 1,
                  }}>
                    ${salePrice.toFixed(2)}
                  </div>
                  <div style={{
                    ...TYPO.cardBody,
                    color: MUTED,
                    textDecoration: "line-through",
                    fontFamily: FONT,
                  }}>
                    ${deal.originalPrice.toFixed(2)}
                  </div>
                  <div style={{
                    ...TYPO.cardMeta,
                    fontWeight: 700,
                    color: GREEN,
                    background: GREEN + "14",
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontFamily: FONT,
                  }}>
                    SAVE ${deal.savings.toFixed(2)}
                  </div>
                </div>
              </div>
              
              {/* Deal Footer - Large button */}
              <div style={{
                padding: "12px 16px",
                background: "#FAFAFA",
                borderTop: "1px solid " + BORDER,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <div style={{
                  ...TYPO.cardMeta,
                  color: MUTED,
                  fontFamily: FONT,
                }}>
                  Item #{deal.itemNum} · Limit {deal.limit}
                </div>
                {(() => {
                  const isInList = itemsInList.has(deal.name.toLowerCase()) || addedDeals.has(deal.id);
                  return (
                    <button
                      className="tap"
                      onClick={() => addDealToList(deal)}
                      style={{
                        border: "none",
                        background: isInList ? GREEN : BLUE,
                        color: "#fff",
                        borderRadius: 8,
                        padding: "10px 18px",
                        ...TYPO.cardBody,
                        fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontFamily: FONT,
                        minHeight: 44,
                        WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      {isInList ? "✓ In List" : "+ Add to List"}
                    </button>
                  );
                })()}
              </div>
            </div>
          );
        })}
        
        {/* Saved items summary */}
        {savedDeals.size > 0 && (
          <div style={{
            background: "#fff",
            borderRadius: 14,
            padding: "16px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            display: "flex",
            alignItems: "center",
            gap: 14,
            animation: "fadeUp 0.2s ease both",
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: RED + "14",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
            }}>
              ❤️
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontSize: 16, 
                fontWeight: 700, 
                color: TEXT,
                fontFamily: FONT,
              }}>
                {savedDeals.size} Saved Deal{savedDeals.size > 1 ? "s" : ""}
              </div>
              <div style={{ 
                fontSize: 13, 
                color: MUTED, 
                marginTop: 3,
                fontFamily: FONT,
              }}>
                Don't forget to grab these on your next trip!
              </div>
            </div>
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
