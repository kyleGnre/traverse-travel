# 🌍 Traverse – CesiumJS Travel Itinerary Planner

## Demo - https://youtu.be/7bnjq6lKPgc?si=W5P5Qc5DyXFS5fds

Traverse is an interactive 3D travel planning application powered by **CesiumJS**. It allows users to explore cities around the globe, discover points of interest (POIs), and build personalized travel itineraries with interactive notes and saved trips. Built with modern JavaScript and geolocation APIs, it's designed for a smooth and visually immersive planning experience.

---

## 🚀 Features

- 🌐 **3D Globe Viewer** powered by CesiumJS and Bing Maps
- 🧭 **City Search** with real-time fly-to camera navigation
- 🗺️ **POI Category Selection** via [OpenTripMap API]
- 📌 **Interactive POI Markers** with hover tooltips and click prompts
- 🔗 **Add POIs to Notes** as Google Search hyperlinks
- ✍️ **Contenteditable Notes Section** with mixed text and links
- 💾 **Local Trip Saving & Deletion** using `localStorage`
- 🧳 **Scrollable Saved Trip Panel** with rich formatting
- 💡 **Recommended Places Section** revealed on scroll
- 🎨 **Custom Dark UI Theme** with hover effects and styled buttons

---

## 🛠 Tech Stack

- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Mapping**: [CesiumJS](https://cesium.com/platform/cesiumjs/)
- **Geolocation API**: [OpenTripMap](https://opentripmap.io/)
- **Search**: Google Search (linked via query URLs)
- **Persistence**: `localStorage`

---

## 📦 Installation

1. Clone the repo:
   ```bash
   git clone https://github.com/kyleGnre/traverse-travel.git
   cd traverse-app
