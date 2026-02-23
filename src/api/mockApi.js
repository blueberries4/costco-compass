// Mock API - Simulates backend API calls with realistic delays
// In production, replace these with actual fetch() calls to your backend

import { SAMPLE_TRIPS, SAMPLE_WISHLIST } from "../data";

// Simulate network delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory store (simulates database)
let tripsStore = [...SAMPLE_TRIPS];
let wishlistStore = [...SAMPLE_WISHLIST];
let listStore = [
  { id: 1, name: "Kirkland Paper Towels", category: "Household", checked: false, source: "suggested" },
  { id: 2, name: "Rotisserie Chicken", category: "Groceries", checked: false, source: "manual" },
  { id: 3, name: "Kirkland Olive Oil 2L", category: "Groceries", checked: true, source: "suggested" },
  { id: 4, name: "Organic Eggs 24ct", category: "Groceries", checked: false, source: "manual" },
  { id: 5, name: "Kirkland Mixed Nuts", category: "Groceries", checked: true, source: "suggested" },
  { id: 6, name: "Bounty Paper Towels", category: "Household", checked: false, source: "manual" },
  { id: 7, name: "Sony WH-1000XM5", category: "Electronics", checked: false, source: "wishlist" },
];

// ═══════════════════════════════════════════════════════════════
// TRIPS API
// ═══════════════════════════════════════════════════════════════

export const tripsApi = {
  // GET /api/trips
  getAll: async () => {
    await delay(250);
    return { success: true, data: [...tripsStore] };
  },

  // GET /api/trips/:id
  getById: async (id) => {
    await delay(150);
    const trip = tripsStore.find(t => t.id === id);
    if (!trip) return { success: false, error: "Trip not found" };
    return { success: true, data: trip };
  },

  // POST /api/trips
  create: async (trip) => {
    await delay(300);
    const newTrip = { ...trip, id: Date.now() };
    tripsStore = [...tripsStore, newTrip];
    return { success: true, data: newTrip };
  },

  // PUT /api/trips/:id
  update: async (id, updates) => {
    await delay(200);
    const index = tripsStore.findIndex(t => t.id === id);
    if (index === -1) return { success: false, error: "Trip not found" };
    tripsStore[index] = { ...tripsStore[index], ...updates };
    return { success: true, data: tripsStore[index] };
  },

  // DELETE /api/trips/:id
  delete: async (id) => {
    await delay(200);
    tripsStore = tripsStore.filter(t => t.id !== id);
    return { success: true };
  },
};

// ═══════════════════════════════════════════════════════════════
// WISHLIST API
// ═══════════════════════════════════════════════════════════════

export const wishlistApi = {
  // GET /api/wishlist
  getAll: async () => {
    await delay(200);
    return { success: true, data: [...wishlistStore] };
  },

  // POST /api/wishlist
  create: async (item) => {
    await delay(250);
    const newItem = { ...item, id: Date.now() };
    wishlistStore = [...wishlistStore, newItem];
    return { success: true, data: newItem };
  },

  // DELETE /api/wishlist/:id
  delete: async (id) => {
    await delay(150);
    wishlistStore = wishlistStore.filter(i => i.id !== id);
    return { success: true };
  },
};

// ═══════════════════════════════════════════════════════════════
// SHOPPING LIST API
// ═══════════════════════════════════════════════════════════════

export const listApi = {
  // GET /api/list
  getAll: async () => {
    await delay(200);
    return { success: true, data: [...listStore] };
  },

  // POST /api/list
  addItem: async (item) => {
    await delay(150);
    const newItem = { ...item, id: Date.now() };
    listStore = [...listStore, newItem];
    return { success: true, data: newItem };
  },

  // PUT /api/list/:id/toggle
  toggleItem: async (id) => {
    await delay(100);
    const index = listStore.findIndex(i => i.id === id);
    if (index === -1) return { success: false, error: "Item not found" };
    listStore[index] = { ...listStore[index], checked: !listStore[index].checked };
    return { success: true, data: listStore[index] };
  },

  // DELETE /api/list/:id
  removeItem: async (id) => {
    await delay(100);
    listStore = listStore.filter(i => i.id !== id);
    return { success: true };
  },

  // DELETE /api/list/checked
  clearChecked: async () => {
    await delay(150);
    listStore = listStore.filter(i => !i.checked);
    return { success: true, data: [...listStore] };
  },

  // POST /api/list/bulk
  addBulk: async (items) => {
    await delay(200);
    const newItems = items.map(item => ({ ...item, id: Date.now() + Math.random() }));
    listStore = [...listStore, ...newItems];
    return { success: true, data: newItems };
  },
};

// ═══════════════════════════════════════════════════════════════
// SUGGESTIONS API (based on purchase patterns)
// ═══════════════════════════════════════════════════════════════

export const suggestionsApi = {
  // GET /api/suggestions
  getAll: async () => {
    await delay(300);
    // This would normally be computed server-side
    return {
      success: true,
      data: {
        staples: [], // Computed from trips in the app
        popular: [
          { name: "Kirkland Coffee 3lb", category: "Groceries", reason: "Top seller" },
          { name: "Rotisserie Chicken", category: "Groceries", reason: "Only $4.99" },
          { name: "Organic Eggs 24ct", category: "Groceries", reason: "Weekly essential" },
          { name: "Kirkland Milk 2-Pack", category: "Groceries", reason: "Fresh weekly" },
        ],
      },
    };
  },
};

// ═══════════════════════════════════════════════════════════════
// MEMBER API
// ═══════════════════════════════════════════════════════════════

export const memberApi = {
  // GET /api/member/profile
  getProfile: async () => {
    await delay(150);
    return {
      success: true,
      data: {
        type: "Executive",
        fee: 130,
        household: ["You", "Partner"],
        cashbackRate: 0.02,
        gasCashbackRate: 0.04,
        cashbackMax: 1250,
        renewalMonth: 10, // October
      },
    };
  },

  // GET /api/member/stats
  getStats: async () => {
    await delay(200);
    // Would be computed server-side in production
    return {
      success: true,
      data: {
        totalSaved: 0, // Computed client-side for now
        cashbackYTD: 0,
        tripsCount: tripsStore.length,
      },
    };
  },
};
