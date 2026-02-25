import { AMBER, BLUE, CARD, GREEN, MUTED, RED, SOFT, TEXT, CAT_ICON, BORDER } from "../constants";

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
      background: "#fff",
      borderRadius: 10,
      overflow: "hidden",
      border: `1px solid ${BORDER}`,
      animation: `fadeUp 0.25s ${animDelay}s ease both`,
    }}>
      {/* Header - Costco style */}
      <div style={{ 
        padding: "12px 14px",
        borderBottom: `1px solid ${BORDER}`,
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center"
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>Suggested for You</div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>Based on your history</div>
        </div>
        <div style={{
          fontSize: 12,
          color: BLUE,
          fontWeight: 600,
          cursor: "pointer",
        }}>
          View all
        </div>
      </div>

      {/* Suggestion list - cleaner vertical layout */}
      <div style={{ padding: "8px 0" }}>
        {allSuggestions.map((item, i) => (
          <div
            key={`${item.name}-${i}`}
            className="tap"
            onClick={() => onAddToList?.(item)}
            style={{
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              cursor: "pointer",
              borderBottom: i < allSuggestions.length - 1 ? `1px solid ${BORDER}` : "none",
            }}
          >
            <span style={{ fontSize: 24 }}>{item.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: TEXT }}>
                {item.name}
              </div>
              <div style={{ 
                fontSize: 12, 
                color: item.type === "staple" ? RED : MUTED,
                marginTop: 2 
              }}>
                {item.reason}
              </div>
            </div>
            <div style={{
              background: item.type === "staple" ? RED : BLUE,
              color: "#fff",
              fontSize: 11,
              fontWeight: 600,
              padding: "6px 12px",
              borderRadius: 6,
            }}>
              Add
            </div>
          </div>
        ))}
      </div>

      {/* Restock all button - only show if there are overdue staples */}
      {overdueStaples.length > 0 && (
        <div style={{ padding: "8px 14px 14px", borderTop: `1px solid ${BORDER}` }}>
          <div
            className="tap"
            onClick={() => {
              overdueStaples.forEach(item => onAddToList?.(item));
            }}
            style={{
              background: RED,
              borderRadius: 8,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              gap: 8,
            }}
          >
            <span style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>
              Restock All ({overdueStaples.length})
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
