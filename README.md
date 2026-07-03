# LeadFlow Mini

A production-ready **Lead Distribution System** built with React 19, Node.js/Express, and MongoDB Atlas.

## 🚀 Quick Start 
  
### Prerequisites  
- Node.js 18+  
- MongoDB Atlas account (or local MongoDB)   
 
---   
  
## Backend Setup

```bash
cd server
npm install

# Copy and configure environment variables
copy .env.example .env
# Edit .env with your MongoDB URI

# Start development server
npm run dev

# Seed the database (first time)
npm run seed
```

**Backend runs on:** `http://localhost:5000`

---

## Frontend Setup

```bash
cd client
npm install

# Start development server
npm run dev
```

**Frontend runs on:** `http://localhost:5173`

---

## 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@leadflow.com | Admin@123 |
| Agent 1 | agent1@leadflow.com | Agent@123 |
| Agent 2 | agent2@leadflow.com | Agent@123 |
| Agent 3 | agent3@leadflow.com | Agent@123 |

---

## 📁 Project Structure

```
├── client/              # React 19 + Vite frontend
│   └── src/
│       ├── pages/       # Admin + Agent pages
│       ├── components/  # Reusable UI components
│       ├── context/     # Auth + Theme context
│       ├── services/    # API service layer
│       ├── routes/      # Protected route guards
│       └── layouts/     # App layout shell
│
└── server/              # Node.js + Express backend
    ├── controllers/     # Business logic
    ├── models/          # Mongoose schemas
    ├── routes/          # Express routes
    ├── middleware/      # Auth + error handlers
    ├── config/          # DB connection
    └── utils/           # Seeder script
```

---

## 🌐 API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/auth/login | Public | Login |
| POST | /api/auth/logout | Private | Logout |
| GET | /api/auth/me | Private | Current user |
| GET | /api/agents | Admin | List agents |
| POST | /api/agents | Admin | Create agent |
| PUT | /api/agents/:id | Admin | Update agent |
| DELETE | /api/agents/:id | Admin | Delete agent |
| GET | /api/leads | Private | List leads |
| POST | /api/leads | Admin | Create lead |
| PUT | /api/leads/:id | Private | Update lead |
| DELETE | /api/leads/:id | Admin | Delete lead |
| POST | /api/leads/import | Admin | CSV import |
| POST | /api/distribute | Admin | Distribute leads |
| GET | /api/analytics | Admin | Analytics data |

---

## 🚢 Deployment

### Frontend (Vercel)

1. Push `client/` to GitHub
2. Import to Vercel
3. Set `VITE_API_URL=https://your-backend.onrender.com`
4. Deploy

### Backend (Render)

1. Push `server/` to GitHub
2. Create a new **Web Service** on Render
3. Set environment variables:
   - `MONGO_URI` — Your MongoDB Atlas connection string
   - `JWT_SECRET` — A strong random secret
   - `CLIENT_URL` — Your Vercel frontend URL
   - `NODE_ENV=production`
4. Build command: `npm install`
5. Start command: `npm start`

### MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a database user
3. Whitelist `0.0.0.0/0` (for Render dynamic IPs)
4. Copy the connection string to `MONGO_URI`

---

## ✨ Features

- 🔐 JWT Auth in HttpOnly Cookies (secure)
- 👤 Role-based access (Admin / Agent)
- 📊 Analytics with Recharts (Pie, Bar, Line)
- 📤 CSV Import with row-by-row validation
- ⚡ Round-robin lead distribution
- 🌙 Dark / Light mode toggle
- 📱 Fully responsive design
- 🔍 Search, filter, pagination
- 🔔 Toast notifications (Sonner)
- ⚡ Loading skeletons
