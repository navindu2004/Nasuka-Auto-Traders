# 🚗 Nasuka Auto Traders

**Empowering Global Car Buyers with Real-Time Access to Japan’s Auto Market**

---

![MongoDB](https://img.shields.io/badge/MongoDB-green?logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-black?logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-blue?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-green?logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 📘 Overview

**Nasuka Auto Traders** is a full-stack web platform designed to simplify **international car trading from Japan**.  
Instead of maintaining physical stock, Nasuka acts as a **trusted intermediary** — allowing users to **browse live listings** from Japan’s car market, **place purchase orders**, and **track the buying, shipping, and delivery process** end-to-end.

Built with the **MERN stack (MongoDB, Express, React, Node.js)**, the platform focuses on transparency, automation, and user confidence in cross-border automotive purchasing.

---

## 🚀 Core Features

### 🏎️ Comprehensive Car Listings  
- Aggregated real-time car data from Japan’s leading marketplaces.  
- Search and filter by **make, model, year, mileage, transmission, and price**.  
- Detailed car view with **specifications, photos, and market price trends**.  

### 🛒 Order Placement & Management  
- Seamless order creation form with integrated **car details and buyer info**.  
- Automatic order tracking — from **purchase confirmation → shipment → delivery**.  
- Buyer dashboard to **view active, pending, and completed orders**.

### 💳 Secure Payment Gateway  
- Integrated payment system with **multi-currency support**.  
- **Escrow-like process** ensuring transaction safety.  
- **Stripe / PayPal** integration (configurable).  

### 📦 Shipment & Tracking System  
- Real-time **purchase and shipping status** tracking.  
- Integration with **shipping carriers** and **port tracking APIs**.  
- Notifications for **order progress updates**.

### 📈 Real-Time Market Data  
- Live **pricing data feed** directly from Japanese car markets.  
- Dynamic market-based price adjustments and **currency conversion**.  

### 🔐 Authentication & User Management  
- Secure **JWT-based authentication** with roles (Admin / Buyer).  
- Account dashboard for managing **orders, payments, and personal info**.  
- Email verification and password reset workflows.  

### 🧩 Admin Panel  
- Manage car listings, users, and orders.  
- View sales metrics and shipment analytics.  
- CRUD operations on inventory proxy data (since no physical stock).  

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React.js + Tailwind CSS / Material UI |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB (Mongoose ORM) |
| **Authentication** | JWT + bcrypt |
| **Payments** | Stripe / PayPal API |
| **Data Source** | Integrated with external Japan car market APIs |
| **Hosting** | AWS / Vercel / Render (depending on deployment) |

---

## ⚙️ Getting Started

Follow these steps to run the project locally.

### ✅ Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Git
- Stripe/PayPal account (for payments)
- Valid API key for Japan car market data provider

---

### 🧩 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/NasukaAutoTraders.git
Navigate into the project
cd NasukaAutoTraders
Install dependencies
cd server && npm install
cd ../client && npm install
Configure environment
Create a .env file in the server/ folder:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
STRIPE_SECRET_KEY=your_stripe_key
MARKET_API_KEY=your_market_data_api_key
CLIENT_URL=http://localhost:3000
▶️ Running the Project
Start the backend
cd server
npm run dev
Start the frontend
cd client
npm start
Your app should now be running at:
➡️ Frontend: http://localhost:3000
➡️ Backend API: http://localhost:5000
🧪 Testing
Run backend tests:
cd server
npm test
Run frontend tests:
cd client
npm test
🌍 Future Roadmap
✅ Multi-language support (English, Japanese, Sinhala)
✅ Mobile-responsive UI
📱 Nasuka Auto Traders mobile app (React Native)
🧾 Integration with customs/shipping databases
💬 Live chat with purchasing agents
📦 Vehicle inspection data integration (JEVIC / AUCNET)
🔧 AI-based price recommendation engine
