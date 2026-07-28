# 🚀 NovaAI - Universal AI Assistant

A complete, production-ready AI assistant platform with chat, voice input, file upload, image generation, GitHub integration, and admin dashboard — all in one.

Built by [@vxl_404](https://www.instagram.com/vxl_404?igsh=cTJ6a2E4b3gxZ2Ny) on Instagram.

---

## ✨ Features

- 🤖 **AI Chat** — Powered by Gemini 2.0 Flash or GPT-4o Mini
- 🎤 **Voice Input** — Speak your messages with microphone support
- 📁 **File Upload** — Upload and analyze text/code files
- 🖼️ **Image Generation** — Generate images with AI (DALL-E 3 / Gemini)
- 💾 **Chat Memory** — All conversations saved, searchable history
- 🔐 **Authentication** — Email/password login + GitHub OAuth + Google OAuth
- 🐙 **GitHub Integration** — Connect repos, browse code from chat
- 👑 **Admin Dashboard** — Manage users, API keys, system settings
- 🎨 **Beautiful UI** — Dark mode, responsive, professional design
- 📱 **Mobile Friendly** — Works on all devices
- 💬 **Markdown Rendering** — Code highlighting, tables, formatting
- 📥 **Download Chats** — Export conversations as text files

---

## 📋 Prerequisites

- **Node.js** 18+ (download from [nodejs.org](https://nodejs.org))
- **npm** (comes with Node.js)
- **Gemini API Key** (FREE — get from [Google AI Studio](https://aistudio.google.com/app/apikey))
- **GitHub OAuth App** (optional, for GitHub login — [create one here](https://github.com/settings/developers))

---

## 🛠️ Installation (Local)

```bash
# 1. Clone or download this project
cd ai-assistant-platform

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local

# 4. Edit .env.local with your API keys
#    - Add your GEMINI_API_KEY (required)
#    - Add GitHub OAuth credentials (optional for GitHub login)

# 5. Run the development server
npm run dev

# 6. Open http://localhost:3000 in your browser
```

---

## 🔑 Getting API Keys (FREE)

### Gemini API Key (Primary AI)
1. Go to: https://aistudio.google.com/app/apikey
2. Click **"Create API Key"**
3. Copy the key
4. Paste in `.env.local`: `GEMINI_API_KEY=your_key_here`
5. **This is FREE** — no credit card needed!

### GitHub OAuth (For GitHub Login)
1. Go to: https://github.com/settings/developers
2. Click **"New OAuth App"**
3. Set:
   - Homepage URL: `http://localhost:3000`
   - Callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret
5. Paste in `.env.local`

---

## 🚀 Deployment

### Deploy on Vercel (Free & Easiest)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click **"New Project"** → Import your GitHub repo
4. Add Environment Variables:
   ```
   GEMINI_API_KEY=your_gemini_key
   NEXTAUTH_SECRET=random_string_here
   NEXTAUTH_URL=https://your-app.vercel.app
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_secret
   ADMIN_EMAIL=admin@zaro.ai
   ADMIN_PASSWORD=NovaAI@2024
   ```
5. Click **Deploy** — it's live in 2 minutes!

### Deploy on Railway

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"** → Deploy from GitHub repo
3. Add same environment variables
4. Deploy!

### Deploy on Render

1. Go to [render.com](https://render.com)
2. Click **"New Web Service"** → Connect GitHub repo
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Add environment variables → Deploy!

---

## 🔐 Login Credentials

### Admin Account (pre-configured):
- **Email:** `admin@zaro.ai`
- **Password:** `NovaAI@2024`

### Create User Account:
- Click "Create Account" on the login page
- Or use GitHub/Google OAuth login

---

## 📁 Project Structure

```
ai-assistant-platform/
├── app/
│   ├── api/
│   │   ├── auth/          # Authentication (NextAuth)
│   │   ├── chat/          # Chat API
│   │   ├── github/        # GitHub integration
│   │   ├── upload/        # File upload
│   │   ├── image/         # Image generation
│   │   └── admin/         # Admin dashboard APIs
│   ├── chat/              # Chat interface page
│   ├── admin/             # Admin dashboard page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Login/landing page
│   └── globals.css        # Global styles
├── components/
│   ├── ChatMessage.tsx    # Chat bubble component
│   ├── Sidebar.tsx        # Chat sidebar
│   ├── VoiceInput.tsx     # Microphone/voice input
│   ├── Providers.tsx      # NextAuth provider
│   └── ThemeProvider.tsx  # Dark mode provider
├── lib/
│   ├── db.ts              # SQLite database
│   └── ai.ts              # AI integration (Gemini + OpenAI)
├── public/
│   └── uploads/           # Uploaded files
├── .env.local             # Environment variables
├── .env.example           # Example env template
├── package.json
├── tailwind.config.js
├── next.config.js
└── middleware.ts          # Auth middleware
```

---

## 🎯 Usage

1. **Login** — Use admin credentials or create your account
2. **Chat** — Type messages, the AI responds instantly
3. **Voice** — Click the 🎤 mic button and speak (Chrome/Edge)
4. **Upload Files** — Drag & drop code/text files for analysis
5. **Generate Images** — Type "generate image of..." to create images
6. **Connect GitHub** — Go to admin → API Keys → Add GitHub token
7. **Admin Panel** — Login as admin → click gear icon → manage everything

---

## ⚙️ Configuration

All configurable in `.env.local`:

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `OPENAI_API_KEY` | OpenAI API key | No |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | No |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret | No |
| `NEXTAUTH_SECRET` | Random string for JWT | Yes |
| `NEXTAUTH_URL` | Your app URL | Yes |
| `ADMIN_EMAIL` | Admin login email | No |
| `ADMIN_PASSWORD` | Admin password | No |

---

## 🛡️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **AI:** Google Gemini 2.0 Flash + OpenAI GPT-4o
- **Auth:** NextAuth.js (Credentials + GitHub + Google OAuth)
- **Database:** SQLite (via sql.js)
- **Styling:** Tailwind CSS
- **Icons:** React Icons
- **Markdown:** React Markdown + Syntax Highlighter

---

## 📸 Screenshots

- Beautiful login page with GitHub/Google OAuth
- Clean chat interface with markdown rendering
- Voice input with microphone support
- Admin dashboard for full control
- Code syntax highlighting
- Dark mode professional UI

---

## 🔧 Troubleshooting

**"Gemini API Key Not Configured"**
→ Add `GEMINI_API_KEY` to `.env.local` (get free key from Google AI Studio)

**GitHub login not working**
→ Make sure GitHub OAuth callback URL is correct:
`http://localhost:3000/api/auth/callback/github` (local) or
`https://yourdomain.com/api/auth/callback/github` (production)

**Voice input not working**
→ Use Chrome or Edge (Web Speech API support). Firefox/Safari may not work.

**Database errors**
→ Delete the `data/` folder and restart — it will be auto-created.

---

## 📝 License

MIT — Free to use, modify, and distribute.

---

## 👤 Creator

Built with ❤️ by [@vxl_404](https://www.instagram.com/vxl_404?igsh=cTJ6a2E4b3gxZ2Ny)

For questions, feature requests, or custom development — DM on Instagram!

---

⭐ **Star this project if you find it useful!**
