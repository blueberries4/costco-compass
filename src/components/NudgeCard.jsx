import { AMBER, BLUE, CARD, GREEN, MUTED, RED, SOFT, TEXT, CAT_ICON } from "../constants";

// Fallback suggestions for new users with no history
const FALLBACK_SUGGESTIONS = [
  { name: "Kirkland Coffee", category: "Groceries", reason: "Top seller", icon: "☕" },
  { name: "Organic Eggs 24ct", category: "Groceries", reason: "Great value", icon: "🥚" },
  { name: "Kirkland Milk 2-Pack", category: "Groceries", reason: "Weekly essential", icon: "🥛" },
  { name: "Rotisserie Chicken", category: "Groceries", reason: "Only $4.99", icon: "🍗" },
];

export default function NudgeCard({ staples = [], allItems = [], onAddToList, animDelay = 0 }) {
  // Helper to generate meaningful restock message
  const getRestockReason = (staple) => {
    const overdueDays = staple.daysSince - staple.avgGap;
    if (overdueDays > 14) return "You're definitely out by now";
    if (overdueDays > 7) return "Probably running low";
    if (overdueDays > 0) return "Time to restock";
    const daysLeft = staple.avgGap - staple.daysSince;
    if (daysLeft <= 3) return "Running low soon";
    if (daysLeft <= 7) return `About ${daysLeft} days left`;
    return `Restock in ~${daysLeft}d`;
  };

  // 1. Overdue staples (highest priority - things you definitely need)
  const overdueStaples = staples
    .filter(s => s.duePct >= 75)
    .slice(0, 2)
    .map(s => ({
      name: s.name,
      category: s.category,
      reason: getRestockReason(s),
      icon: CAT_ICON[s.category] || "📦",
      priority: s.duePct >= 100 ? "high" : "medium",
      type: "staple",
    }));

  // 2. Pattern-based suggestions (items bought 2+ times but not yet a "staple")
  const itemCounts = {};
  allItems.forEach(item => {
    const key = item.name.trim().toLowerCase();
    if (!itemCounts[key]) {
      itemCounts[key] = { name: item.name, category: item.category, kirkland: item.kirkland, count: 0 };
    }
    itemCounts[key].count++;
  });

  const patternSuggestions = Object.values(itemCounts)
    .filter(item => item.count >= 2 && item.count < 3) // Bought 2x but not yet a staple (3+)
    .filter(item => !overdueStaples.some(s => s.name.toLowerCase() === item.name.toLowerCase()))
    .sort((a, b) => b.count - a.count)
    .slice(0, 2)
    .map(item => ({
      name: item.name,
      category: item.category,
      reason: `Bought ${item.count}x before`,
      icon: CAT_ICON[item.category] || "📦",
      priority: "low",
      type: "pattern",
      isKirkland: item.kirkland,
    }));

  // 3. Kirkland favorites (Kirkland items you've bought - smart money savers)
  const kirklandFavorites = Object.values(itemCounts)
    .filter(item => item.kirkland && item.count >= 1)
    .filter(item => !overdueStaples.some(s => s.name.toLowerCase() === item.name.toLowerCase()))
    .filter(item => !patternSuggestions.some(p => p.name.toLowerCase() === item.name.toLowerCase()))
    .sort((a, b) => b.count - a.count)
    .slice(0, 1)
    .map(item => ({
      name: item.name,
      category: item.category,
      reason: "Kirkland = ~22% savings",
      icon: "🟣",
      priority: "low",
      type: "kirkland",
    }));

  // 4. Combine all suggestions, fill with fallbacks if needed
  let allSuggestions = [...overdueStaples, ...patternSuggestions, ...kirklandFavorites];
  
  // Fill remaining slots with fallback suggestions
  if (allSuggestions.length < 4) {
    const usedNames = allSuggestions.map(s => s.name.toLowerCase());
    const fallbacks = FALLBACK_SUGGESTIONS
      .filter(f => !usedNames.includes(f.name.toLowerCase()))
      .slice(0, 4 - allSuggestions.length)
      .map(f => ({ ...f, priority: "low", type: "popular" }));
    allSuggestions = [...allSuggestions, ...fallbacks];
  }

  allSuggestions = allSuggestions.slice(0, 4);

  const priorityColor = {
    high: RED,
    medium: AMBER,
    low: BLUE,
  };

  const typeLabel = {
    staple: "Restock",
    pattern: "Buy again",
    kirkland: "Kirkland",
    popular: "Popular",
  };

  const typeBg = {
    staple: RED,
    pattern: GREEN,
    kirkland: "#8B5CF6",
    popular: BLUE,
  };

  return (
    <div style={{
      background: CARD,
      borderRadius: 14,
      padding: "14px 15px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      animation: `fadeUp 0.28s ${animDelay}s ease both`,
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>💡</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>Quick Add Suggestions</div>
            <div style={{ fontSize: 10, color: MUTED }}>Based on your buying patterns</div>
          </div>
        </div>
        <div style={{
          fontSize: 9,
          color: GREEN,
          fontWeight: 500,
          background: `${GREEN}12`,
          padding: "3px 8px",
          borderRadius: 10,
        }}>
          Tap to add
        </div>
      </div>

      {/* Suggestion grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {allSuggestions.map((item, i) => (
          <div
            key={`${item.name}-${i}`}
            className="tap lift"
            onClick={() => onAddToList?.(item)}
            style={{
              background: item.type === "staple" ? `${priorityColor[item.priority]}08` : SOFT,
              border: item.type === "staple" ? `1px solid ${priorityColor[item.priority]}20` : "1px solid transparent",
              borderRadius: 11,
              padding: "10px 11px",
              cursor: "pointer",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 15 }}>{item.icon}</span>
              <span style={{
                fontSize: 8,
                fontWeight: 600,
                color: typeBg[item.type],
                background: `${typeBg[item.type]}12`,
                padding: "2px 5px",
                borderRadius: 4,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}>
                {typeLabel[item.type]}
              </span>
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: TEXT, lineHeight: 1.3, marginBottom: 2 }}>
              {item.name}
            </div>
            <div style={{ fontSize: 9, color: item.type === "staple" ? priorityColor[item.priority] : MUTED }}>
              {item.reason}
            </div>
          </div>
        ))}
      </div>

      {/* Restock all button - only show if there are overdue staples */}
      {overdueStaples.length > 0 && (
        <div
          className="tap"
          onClick={() => {
            overdueStaples.forEach(item => onAddToList?.(item));
          }}
          style={{
            marginTop: 10,
            background: `linear-gradient(135deg, ${RED}12, ${AMBER}08)`,
            border: `1px solid ${RED}18`,
            borderRadius: 10,
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14 }}>🔄</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: RED }}>
                Restock {overdueStaples.length} staple{overdueStaples.length !== 1 ? "s" : ""}
              </div>
              <div style={{ fontSize: 9, color: MUTED }}>
                Add all overdue items to your list
              </div>
            </div>
          </div>
          <div style={{
            background: RED,
            color: "#fff",
            fontSize: 10,
            fontWeight: 600,
            padding: "5px 10px",
            borderRadius: 8,
          }}>
            + Add all
          </div>
        </div>
      )}

      {/* See all link */}
      <div
        className="tap"
        style={{
          marginTop: 10,
          textAlign: "center",
          fontSize: 11,
          color: BLUE,
          fontWeight: 500,
          cursor: "pointer",
          padding: "6px 0",
        }}
      >
        See all suggestions →
      </div>
    </div>
  );
}
