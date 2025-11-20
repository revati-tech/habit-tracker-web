# 🌿 Habit Tracker — Frontend

A modern, responsive **Next.js + TypeScript** frontend for the Habit Tracker application.  
Connects to the Spring Boot backend for authentication, habit management, and habit completion tracking.

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | **Next.js 14+ (App Router)** |
| Language | **TypeScript** |
| UI | **Tailwind CSS** |
| HTTP Client | **Axios** |
| Auth | JWT tokens (stored in HTTP-only cookies or memory) |
| Dev Tools | Cursor AI, React Compiler, ESLint, Prettier |

## 📁 Project Structure

```
habit-tracker-frontend/
├── app/
│   ├── login/          # Login page
│   ├── signup/         # Signup page (optional)
│   ├── habits/         # List & manage habits
│   ├── layout.tsx
│   └── page.tsx
├── components/         # Reusable UI components
├── lib/
│   ├── api.ts          # Axios instance
│   └── auth.ts         # Auth utilities
├── public/
├── styles/
│   └── globals.css
├── package.json
└── README.md
```

## 🧰 Getting Started

### 1️⃣ Install Dependencies
```bash
npm install
```

### 2️⃣ Run Dev Server
```bash
npm run dev
```

The app will be available at:

👉 http://localhost:3000

## 🔗 Backend API (Required)

Set your backend URL (Spring Boot server):

Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

## 🔐 Authentication Flow

The frontend connects to:

- `POST /api/auth/login`
- `POST /api/auth/signup`
- `GET  /api/users/me`

We store the JWT token in **memory** or **HTTP-only cookie** (depending on the implementation).

After login:
- Save token
- Redirect user to `/habits`

## 📘 Pages Overview

### 🟦 Login Page (`/login`)
- Email + Password form  
- Calls `POST /auth/login`
- On success → redirects to `/habits`

### 🟩 Habits Page (`/habits`)
- Fetches habits via `GET /habits` with Bearer token
- Displays:
  - Habit name
  - Description
  - Button to mark completion
  - Button to delete

### 🟧 Habit Completions
Each habit:
- `POST /habits/{id}/completions`
- `DELETE /habits/{id}/completions/{date}`
- `GET /habits/{id}/completions`

These endpoints integrate directly into your UI.

## 🌈 Styling

The project uses **Tailwind CSS**:

```tsx
<h1 className="text-2xl font-bold text-gray-800">My Habits</h1>
```

## 🔌 Axios Integration

`lib/api.ts` contains your Axios client:

```ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

export default api;
```

## 🔍 Running Lint
```bash
npm run lint
```

## 📦 Deployment

Recommended: **Vercel**

Set env variable:
```
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url/api
```

## 🤝 Contributing

PRs welcome. Use Cursor AI as a copilot.

## 📄 License

MIT License.
