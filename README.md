# 🚀 Meanweber Next-Generation Tech Blog

Welcome to the **Meanweber Tech Blog** repository! 
This project is a high-performance, single-page application (SPA) designed with a premium, Awwwards-winning UI/UX aesthetic. It is completely driven by pure Vanilla JavaScript, zero heavy framework dependencies, and automated by AI!

![Meanweber Blog](content/images/about.png)

## ✨ Core Features

*   **⚡ Blazing Fast Performance:** 100% Vanilla JS architecture. No loading screens, no heavy frameworks—built for maximum SEO & Core Web Vitals scores.
*   **🎨 Premium Awwwards UI/UX:** 
    *   **3D Glassmorphism Cards:** Interactive tilt hover effects.
    *   **Interactive Pointer:** Custom glowing cursor with mix-blend-mode.
    *   **Ambient Glow & Terminal Cursors:** Deep tech aesthetic.
    *   **Seamless Reading Transitions:** Smooth morphing between Home and Article views.
*   **🗂️ Zero-Config Flat File CMS:** All blog content is read directly from `content/data.js`. No complex database is strictly required to run the core blog!
*   **📝 Built-in Markdown Engine:** Simply write your article content in Markdown, and the internal engine automatically parses headers, syntax-highlighted code blocks, and 1-click copy buttons.
*   **🌍 Production-Ready Modals & Database:** Contact modals are wired up to easily support Google Firebase (Firestore), complete with Local Storage fallback for local testing.
*   **🤖 Full AI Automation (CI/CD):** 
    *   Built-in Node.js robot that scrapes global tech news.
    *   Powered by Google's **Gemini AI** to translate and summarize news.
    *   Triggered automatically at 08:00 AM daily via **GitHub Actions**.

---

## 🛠️ Project Structure

\`\`\`
├── index.html                  # Main SPA core file
├── style.css                   # Premium UI Styles & Animations
├── app.js                      # Routing, Parsers, and Interactions logic
├── firebase-db.js              # Production Database Hooks (Contact Form)
├── package.json                # Dependencies for the AI Automation Bot
├── .github/workflows/          # GitHub Actions CI/CD scheduling
├── scripts/                    
│   └── daily-news.js           # Gemini AI Scraper & Content Injector Bot
└── content/     
    ├── data.js                 # Flat-file Database for Blog Posts
    └── images/                 # Image assets
\`\`\`

---

## 🚀 How to Go Live (Vercel + GitHub)

If you have just forked or downloaded this repository, follow these steps to turn it into a living, breathing AI-automated website:

### Step 1: Deploy to Vercel
1. Upload/Push this repository to your GitHub account.
2. Go to [Vercel.com](https://vercel.com/) and click **Add New Project**.
3. Import your GitHub repository.
4. Keep the default settings and hit **Deploy**. Your website is now live!

### Step 2: Set up the AI Auto-Blogger
Your repository has a robot sleeping inside `.github/workflows/daily-news.yml`. It needs an API Key to function.
1. Go to [Google AI Studio](https://aistudio.google.com/) and grab a free **Gemini API Key**.
2. Go to your repository on **GitHub** > **Settings** > **Secrets and variables** > **Actions**.
3. Click **New repository secret**.
4. Name: \`GEMINI_API_KEY\`
5. Value: *(Paste your API key here)*
6. The bot will now automatically post new tech news straight to your site every morning at 08:00 AM (UTC+7)!

### Step 3: Activate Production Database (Optional)
Currently, your "Contact Us" form saves data to local storage. To collect contacts globally:
1. Create a project at [Firebase.google.com](https://firebase.google.com/).
2. Enable **Firestore Database**.
3. Copy your project configuration object.
4. Replace the \`firebaseConfig\` keys in \`firebase-db.js\`.

---

### Developed By
**Meanweber** - Integrating pristine code with beautiful design.
