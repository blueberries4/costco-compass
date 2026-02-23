# Costco Compass 🛒

A smart Costco membership tracker that helps you maximize your Executive membership ROI, track shopping trips, monitor cashback earnings, and predict when you're running low on staples.

![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🏠 Home Dashboard

- **Membership ROI Tracker** — See how much you've saved vs your $130 annual fee
- **Executive Cashback** — Track your 2% + 4% gas cashback with projected annual earnings
- **Contextual Alerts** — Smart prompts based on your shopping patterns (trip due, restocking reminders)
- **Gas Tracking** — Fill-up history, average costs, and next fill-up predictions

### 📋 Smart Shopping List

- **AI-Powered Suggestions** — Predicts items you're running low on based on purchase history
- **Wishlist with Stock Levels** — Track desired items with real-time warehouse stock status
- **Multiple Sources** — Items from manual entry, suggestions, or wishlist

### 🛒 Trip History

- **Auto-Import Ready** — Designed for Costco app integration (manual entry available)
- **Trip Score** — Rate each trip based on planned vs impulse purchases
- **Savings Tracking** — Compare Costco prices to retail for each item
- **Kirkland Detection** — Automatically identifies Kirkland Signature products

### 📊 Insights & Analytics

- **Spending Breakdown** — Category-wise spending with beautiful charts
- **Impulse Analysis** — Track and reduce unplanned purchases
- **Household Stats** — Multi-member trip tracking
- **Best Purchase** — Highlight your biggest savings wins

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/blueberries4/costco-compass.git

# Navigate to project directory
cd costco-compass

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
costco-compass/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx           # React entry point
    ├── index.css          # Global styles & animations
    ├── App.jsx            # Main application
    ├── constants.js       # Design tokens & config
    ├── helpers.js         # Utility functions
    ├── data.js            # Sample data
    └── components/
        ├── atoms.jsx           # Pill, Card, CardTitle
        ├── PageHeader.jsx
        ├── MembershipCard.jsx
        ├── GasCard.jsx
        ├── TripScoreBadge.jsx
        ├── TripCard.jsx
        ├── BottomNav.jsx
        ├── ReceiptScanModal.jsx
        ├── ListTab.jsx
        └── InsightsTab.jsx
```

## 🛠 Built With

- **React 18** — UI framework
- **Vite** — Build tool & dev server
- **Recharts** — Data visualization
- **CSS-in-JS** — Inline styles with design tokens

## 🎨 Design System

| Token   | Color   | Usage                     |
| ------- | ------- | ------------------------- |
| `RED`   | #D92B3A | Primary brand, Costco red |
| `BLUE`  | #005DAA | Secondary, links          |
| `GREEN` | #16a34a | Success, savings          |
| `GOLD`  | #A07800 | Cashback highlights       |
| `AMBER` | #d97706 | Warnings, due alerts      |

**Fonts:** Barlow Condensed (headings), Plus Jakarta Sans (body), DM Mono (numbers)

## 📱 Screenshots

The app is designed mobile-first with a 430px max-width container, mimicking a native iOS app experience.

## 🗺 Roadmap

- [ ] Costco app integration for auto-import
- [ ] Push notifications for restock reminders
- [ ] Price history tracking
- [ ] Barcode scanning
- [ ] Family sharing & sync
- [ ] Dark mode

## 📄 License

MIT License — feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Made with ❤️ for Costco shoppers everywhere
