<div align="center">

# ⚡ DevPulse — Developer Intelligence Platform

> **"Your coding journey. One intelligent dashboard."**

A modern, full-stack developer telemetry hub that aggregates coding velocity across **GitHub, LeetCode, CodeChef, HackerRank, GeeksforGeeks, and AtCoder**. Built with the MERN stack, React 19, Tailwind CSS, Framer Motion, and OpenRouter AI.

[![GitHub license](https://img.shields.io/github/license/Umesh-369/DevPulse?style=for-the-badge&color=E5A952)](https://github.com/Umesh-369/DevPulse/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/Umesh-369/DevPulse?style=for-the-badge&color=38BDF8)](https://github.com/Umesh-369/DevPulse/stargazers)
[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B%20%7C%20v22-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![OpenRouter AI](https://img.shields.io/badge/AI_Engine-OpenRouter%20%2F%20GPT--4o--mini-7C3AED?style=for-the-badge&logo=openai&logoColor=white)](https://openrouter.ai/)

<br/>

[Live Demo](http://localhost:5173) • [Bug Report](https://github.com/Umesh-369/DevPulse/issues) • [Feature Request](https://github.com/Umesh-369/DevPulse/issues)

<br/>

### 🌙 Cosmic Obsidian (Dark Mode Showcase)
![DevPulse Dark Mode Showcase](./docs/images/devpulse-dark-showcase.jpg)

<br/>

### ☀️ Warm Alabaster (Light Mode Showcase)
![DevPulse Light Mode Showcase](./docs/images/devpulse-light-showcase.jpg)

</div>

---

## 💡 Overview

Modern developers write code across fragmented platforms: LeetCode for algorithms, GitHub for open source, and competitive coding portals for contest ratings. **DevPulse unites your entire coding footprint into one single-pane-of-glass dashboard** with automated telemetry syncing, AI-guided career roadmaps, and verifiable portfolios.

---

## 🌟 Key Capabilities

- **Unified Multi-Platform Ingestion:** Live automated syncing for **GitHub, LeetCode, CodeChef, HackerRank, GeeksforGeeks, and AtCoder** via GraphQL and REST endpoints.
- **Pixel-Accurate Dual Theme:** Seamless toggling between **Cosmic Obsidian** (`#0B0D11`) and **Warm Alabaster** (`#FAF8F5`) with golden ochre accents (`#E5A952`).
- **Interactive 3D Motion:** Mouse-reactive 3D perspective tilts on the hero preview powered by Framer Motion.
- **Dynamic Unified Dashboard:** 4 KPI stat cards, a 12-month contribution heatmap, interactive language distribution donut charts, and problem velocity graphs.
- **Verified Developer Portfolio (`/portfolio` & `/u/:username`):** Full CRUD for custom showcase projects, automatic GitHub repository star/fork syncing, and shareable public profile links.
- **AI Career Coach (`/ai-insights`):** Synthesizes telemetry via OpenRouter (GPT-4o-mini) to calculate an overall readiness score, 5-pillar skill analysis, and actionable 7-day checklist milestones with live MongoDB persistence.
- **Live Leaderboard (`/leaderboard`):** Real-time ranking of registered developers with filters for Global, College, and Friends, accompanied by a side-by-side comparison drawer.
- **Productivity Suite:** Searchable coding problems catalog, GitHub repository explorer, goals tracker, and a global Command Palette (**`Ctrl+K`** / **`⌘K`**).

---

## 🧮 Developer Rating Formula

DevPulse normalizes platform performance into an objective, weighted rating score:

$$\text{DevRating} = (8 \times E) + (18 \times M) + (35 \times H) + \min(S \times 5, 200) + \min(R \times 8, 250)$$

- **$E, M, H$**: Easy, Medium, Hard problems solved across connected coding platforms.
- **$S$**: Current consecutive active streak in days (capped at $200$ pts).
- **$R$**: Public GitHub repositories (capped at $250$ pts).

| Rank Tier | Rating Threshold | Rank Tier | Rating Threshold |
| :--- | :---: | :--- | :---: |
| 🔴 **Grandmaster** | $\ge 2400$ | 🔵 **Specialist** | $\ge 1400$ |
| 🟡 **Master** | $\ge 2000$ | 🟢 **Pupil** | $\ge 800$ |
| 🟣 **Expert** | $\ge 1800$ | ⚪ **Newbie** | $< 800$ |

---

## 🛠 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 6, Tailwind CSS 3.4, Framer Motion 12, Recharts 2, Lucide Icons, Canvas Confetti |
| **Backend** | Node.js (v18+ / v22+), Express.js 4.21, Mongoose 8, JWT, Bcrypt.js, Axios |
| **Database** | MongoDB Atlas / Local MongoDB (`User`, `PlatformStats`, `Repository`, `AIReport` schemas) |
| **AI Engine** | OpenRouter API (`openai/gpt-4o-mini`) for developer career intelligence |
| **Integrations** | LeetCode GraphQL, GitHub REST v3 & OAuth 2.0, Google Cloud OAuth 2.0 |

---

## 📁 Project Structure

```text
DevPulse/
├── client/                     # React 19 Frontend (Vite, Tailwind, Recharts)
│   ├── src/components/         # Reusable UI, Layout, Dashboard, and Landing widgets
│   ├── src/pages/              # 13 Application views (Dashboard, Portfolio, AI, etc.)
│   └── src/context/            # AuthContext and ThemeContext
├── server/                     # Express.js REST API Backend
│   ├── config/ & middleware/   # MongoDB connection & JWT authentication
│   ├── models/                 # Mongoose schemas (User, PlatformStats, AIReport)
│   ├── routes/ & services/     # REST controllers, LeetCode GraphQL & GitHub services
│   └── seed/                   # Telemetry generator and demo seed runners
└── docs/images/                # High-resolution documentation showcase images
```

---

## 🚀 Quick Start Guide

### 1. Clone & Install
```bash
git clone https://github.com/Umesh-369/DevPulse.git
cd DevPulse
npm run install:all
```

### 2. Configure Environment
Copy the server environment template:
```bash
cp server/.env.example server/.env
```
Fill in your MongoDB URI and optional API keys in `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/devpulse
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000

# Optional: For AI Career Coach
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=openai/gpt-4o-mini
```

### 3. Run Application
Start backend and frontend simultaneously:
```bash
npm run dev
```

- **Frontend Client:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

*(Optional: populate sample telemetry with `npm run seed`)*

---

## 📡 REST API Reference

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/auth/register` & `/login` | `POST` | Account creation and JWT authentication |
| `/api/auth/github` & `/google` | `GET` | OAuth 2.0 single sign-on flows |
| `/api/user/profile` | `GET` / `PUT` | Read and update developer profile and appearance |
| `/api/user/connect-platform` | `POST` | Connect & verify handles (LeetCode, GitHub, etc.) |
| `/api/projects` | `GET` / `POST` | Fetch merged projects or create custom project cards |
| `/api/projects/:id` | `PUT` / `DELETE`| Update or delete custom showcase project |
| `/api/ai-insights` | `GET` / `POST` | Retrieve latest report or trigger new OpenRouter evaluation |
| `/api/ai-insights/toggle-task` | `POST` | Check off roadmap milestone task in MongoDB |
| `/api/leaderboard` | `GET` | Retrieve real registered users sorted by DevRating |
| `/api/analytics` | `GET` | Multi-platform charts and language distribution |

---

## 🔒 Security Highlights

- **Zero Credentials Storage:** DevPulse never stores passwords of third-party platforms. Telemetry is gathered via public GraphQL APIs or authorized OAuth tokens.
- **Salted Encryption:** Local passwords hashed with `bcryptjs` (salt rounds: 10).
- **Environment Isolation:** Secrets are isolated in `server/.env` and strictly excluded by `.gitignore`.
- **Fault-Tolerant Fallbacks:** Graceful in-memory fallback mechanisms guarantee high availability even during external API rate limiting or maintenance.

---

## 🤝 Contributing & License

Contributions are welcome! Please feel free to open issues and pull requests.

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for details.

### Author
Crafted with passion by **Umesh Sai Hanuma Prasad Syamala**
- GitHub: [@Umesh-369](https://github.com/Umesh-369)
- Repository: [https://github.com/Umesh-369/DevPulse](https://github.com/Umesh-369/DevPulse)

<div align="center">
  <sub>⭐ Star DevPulse on GitHub if you found it useful!</sub>
</div>
