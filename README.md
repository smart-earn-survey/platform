# 💰 Smart Earn Survey Platform

**Answer Surveys and Earn Daily**  
Powered by **Lee Smart Tech**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Project Structure](#project-structure)
5. [Installation Guide](#installation-guide)
6. [Environment Variables](#environment-variables)
7. [API Setup (Survey Providers)](#api-setup)
8. [Payment Integration](#payment-integration)
9. [Deployment](#deployment)
10. [Creating First Admin](#creating-first-admin)
11. [Webhook Configuration](#webhook-configuration)
12. [Security Notes](#security-notes)

---

## 🌟 Overview

Smart Earn Survey is a full-stack survey earning platform optimized for Nigerian users. Users earn money by completing surveys, doing offerwall tasks, referring friends, claiming daily bonuses, and spinning the reward wheel.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB (Atlas) |
| Authentication | JWT |
| Email | Nodemailer (Gmail/SMTP) |
| Payments | Paystack + Flutterwave |
| Frontend Host | Vercel |
| Backend Host | Render |

---

## ✨ Features

- ✅ User registration with email verification
- ✅ JWT authentication + password reset
- ✅ Dashboard with earnings charts
- ✅ Survey system with category filters
- ✅ Offerwall integration (CPX Research, BitLabs, OfferToro, AdGate)
- ✅ Webhook callbacks for auto-crediting
- ✅ Referral system with 10% commission
- ✅ Daily bonus with streak rewards
- ✅ Animated spin wheel (daily)
- ✅ Leaderboard
- ✅ Wallet with full transaction history
- ✅ Withdrawal via Nigerian bank (Paystack)
- ✅ Admin panel with charts
- ✅ User management (ban, credit/debit)
- ✅ Withdrawal approval system
- ✅ Anti-fraud (IP tracking, device fingerprint, rate limiting)
- ✅ Mobile responsive design
- ✅ SEO optimized
- ✅ Dark theme UI

---

## 📁 Project Structure

```
smart-earn/
├── backend/
│   ├── config/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── adminController.js
│   │   ├── surveyController.js
│   │   ├── walletController.js
│   │   └── withdrawalController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Survey.js
│   │   ├── Transaction.js
│   │   ├── Withdrawal.js
│   │   └── Notification.js (Notification, Referral, Announcement)
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── surveys.js
│   │   ├── wallet.js
│   │   ├── withdrawals.js
│   │   ├── referrals.js
│   │   ├── offerwall.js
│   │   ├── admin.js
│   │   ├── notifications.js
│   │   └── webhooks.js
│   ├── utils/
│   │   ├── email.js
│   │   └── cronJobs.js
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── render.yaml
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── Landing.js
    │   │   ├── auth/
    │   │   │   ├── Login.js
    │   │   │   ├── Register.js
    │   │   │   ├── ForgotPassword.js
    │   │   │   ├── ResetPassword.js
    │   │   │   └── VerifyEmail.js
    │   │   ├── dashboard/
    │   │   │   ├── DashboardLayout.js
    │   │   │   ├── Overview.js
    │   │   │   ├── Surveys.js
    │   │   │   ├── Offerwall.js
    │   │   │   ├── Wallet.js
    │   │   │   ├── Withdraw.js
    │   │   │   ├── Referrals.js
    │   │   │   ├── Notifications.js
    │   │   │   ├── SpinWheel.js
    │   │   │   ├── Leaderboard.js
    │   │   │   └── Profile.js
    │   │   └── admin/
    │   │       ├── AdminLayout.js
    │   │       ├── AdminDashboard.js
    │   │       ├── AdminUsers.js
    │   │       ├── AdminWithdrawals.js
    │   │       └── AdminSurveys.js
    │   ├── services/
    │   │   └── api.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── package.json
    ├── tailwind.config.js
    ├── vercel.json
    └── .env.example
```

---

## 🚀 Installation Guide

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)
- Gmail account (for email)
- Paystack account (for Nigerian payments)

---

### 1. Clone / Download the project

```bash
cd smart-earn
```

---

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your values (see Environment Variables section)
nano .env

# Start development server
npm run dev
```

The API will run at `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env
nano .env
# Set REACT_APP_API_URL=http://localhost:5000/api

# Start development server
npm start
```

The app will run at `http://localhost:3000`

---

## ⚙️ Environment Variables

### Backend `.env`

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB - Get from mongodb.com/cloud/atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smartearn

# JWT - Use a random 64-character string
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Email - Gmail with App Password (2FA required)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_16_char_app_password
EMAIL_FROM=Smart Earn Survey <noreply@smartearn.com>

# Frontend URL
FRONTEND_URL=https://your-app.vercel.app

# Admin Secret Key
ADMIN_SECRET_KEY=choose_a_strong_secret

# Paystack - from dashboard.paystack.com
PAYSTACK_SECRET_KEY=sk_live_xxxx
PAYSTACK_PUBLIC_KEY=pk_live_xxxx

# Survey API Keys (optional - configure as you get access)
CPX_RESEARCH_APP_ID=your_app_id
CPX_RESEARCH_HASH_KEY=your_hash_key

BITLABS_TOKEN=your_token

OFFERTORO_APP_ID=your_app_id
OFFERTORO_SECRET=your_secret

ADGATE_MEDIA_USER_ID=your_user_id
ADGATE_MEDIA_API_KEY=your_api_key

# App Settings
REFERRAL_COMMISSION_PERCENT=10
MIN_WITHDRAWAL_AMOUNT=500
DAILY_BONUS_AMOUNT=5
SIGNUP_BONUS=50
```

### Frontend `.env`

```env
REACT_APP_API_URL=https://your-backend.onrender.com/api
REACT_APP_SITE_NAME=Smart Earn Survey
REACT_APP_SITE_SLOGAN=Answer Surveys and Earn Daily
REACT_APP_PAYSTACK_PUBLIC_KEY=pk_live_xxxx
```

---

## 🔌 API Setup (Survey Providers)

### CPX Research
1. Register at [cpx-research.com](https://cpx-research.com)
2. Create an app and get your `App ID` and `Hash Key`
3. Set postback URL to: `https://your-backend.onrender.com/api/webhooks/cpx-research`
4. Add to backend `.env`:
   ```
   CPX_RESEARCH_APP_ID=your_app_id
   CPX_RESEARCH_HASH_KEY=your_hash_key
   ```

### BitLabs
1. Register at [bitlabs.ai](https://bitlabs.ai)
2. Get your API token from dashboard
3. Set postback URL to: `https://your-backend.onrender.com/api/webhooks/bitlabs`
4. Add to backend `.env`:
   ```
   BITLABS_TOKEN=your_token
   ```

### OfferToro
1. Register at [offertoro.com](https://offertoro.com)
2. Get App ID and Secret
3. Set postback URL to: `https://your-backend.onrender.com/api/webhooks/offertoro`
4. Add to backend `.env`:
   ```
   OFFERTORO_APP_ID=your_app_id
   OFFERTORO_SECRET=your_secret
   ```

### AdGate Media
1. Register at [adgatemedia.com](https://adgatemedia.com)
2. Get User ID and API Key
3. Set postback URL to: `https://your-backend.onrender.com/api/webhooks/adgate`
4. Add to backend `.env`:
   ```
   ADGATE_MEDIA_USER_ID=your_user_id
   ADGATE_MEDIA_API_KEY=your_api_key
   ```

---

## 💳 Payment Integration

### Paystack Setup
1. Create account at [paystack.com](https://paystack.com)
2. Go to Settings → API Keys
3. Copy Secret Key (starts with `sk_live_`) and Public Key
4. Add to `.env`
5. Set webhook URL in Paystack dashboard: `https://your-backend.onrender.com/api/webhooks/paystack`

---

## 🌐 Deployment

### Deploy Backend to Render

1. Push backend code to a GitHub repository
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Add all environment variables from your `.env`
6. Deploy — you'll get a URL like `https://smart-earn-api.onrender.com`

### Deploy Frontend to Vercel

1. Push frontend code to a GitHub repository  
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your frontend repo
4. Add environment variables:
   - `REACT_APP_API_URL` = `https://smart-earn-api.onrender.com/api`
   - Other frontend env vars
5. Deploy — you'll get a URL like `https://smart-earn.vercel.app`
6. Update backend `FRONTEND_URL` on Render to match your Vercel URL

---

## 👑 Creating First Admin

After deployment, promote a user to admin via MongoDB Atlas:

1. Open MongoDB Atlas → Browse Collections → `users`
2. Find your user document
3. Edit: change `role` from `"user"` to `"superadmin"`
4. Save

Or via MongoDB shell:
```javascript
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "superadmin", isEmailVerified: true } }
)
```

Then visit `/admin` while logged in as that user.

---

## 🪝 Webhook Configuration

Survey providers send postback callbacks when users complete offers. Configure these URLs in each provider's dashboard:

| Provider | Webhook URL |
|----------|------------|
| CPX Research | `GET /api/webhooks/cpx-research` |
| BitLabs | `GET /api/webhooks/bitlabs` |
| OfferToro | `GET /api/webhooks/offertoro` |
| AdGate Media | `GET /api/webhooks/adgate` |
| Paystack | `POST /api/webhooks/paystack` |

---

## 🔒 Security Notes

- All passwords are hashed with bcrypt (12 salt rounds)
- JWT tokens expire after 7 days
- Rate limiting: 200 req/15min globally, 20 req/15min on auth routes
- MongoDB injection prevented via `express-mongo-sanitize`
- HTTP headers secured via `helmet`
- IP addresses tracked for fraud detection
- Account lockout after 5 failed login attempts (30-minute lockout)
- Webhook signatures verified for Paystack
- CORS restricted to whitelisted origins
- Input validation on all routes

---

## 📞 Support

**Powered by Lee Smart Tech**  
For technical support, contact your development team.

---

## 📄 License

This project is proprietary software developed by Lee Smart Tech. All rights reserved.
