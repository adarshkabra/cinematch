# CineMatch 🎬

AI-powered movie & series recommender built with Groq + Llama 3.

## How It Works

The frontend sends your mood to `/api/recommend` (our own server).  
A serverless function (Netlify) forwards it to Groq with the secret API key.  
The key **never touches the browser** — it lives only in Netlify's environment.

```
Browser → POST /api/recommend → Netlify Function → Groq API
                                  (key lives here)
```

---

## Deploying in 4 Steps

### Step 1 — Push to GitHub

```bash
# In your terminal, inside this folder:
git init
git add .
git commit -m "Initial commit"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/cinematch.git
git push -u origin main
```

### Step 2 — Connect to Netlify

1. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import from Git**
2. Choose GitHub and select your `cinematch` repo
3. Leave build settings as-is (auto-detected from `netlify.toml`)
4. Click **Deploy site**

### Step 3 — Add Your Groq API Key (the important bit)

1. In Netlify dashboard → **Site configuration** → **Environment variables**
2. Click **Add a variable**
3. Key: `GROQ_KEY`  
   Value: `gsk_your_new_key_here` ← paste your key from console.groq.com
4. Click **Save** → then **Trigger deploy** to redeploy with the key active

### Step 4 — Connect Your Custom Domain (optional)

1. Netlify dashboard → **Domain management** → **Add custom domain**
2. Enter your domain (e.g. `cinematch.yoursite.com`)
3. Follow the DNS instructions — usually just adding a CNAME record in your domain registrar

---

## ⚠️ Important: Regenerate Your API Key

If your old key was ever committed to git or shared, regenerate it at:  
👉 https://console.groq.com/keys

The new key goes into Netlify's environment variables only — never in the code.

---

## Project Structure

```
cinematch/
├── index.html                    # The frontend (no API key here)
├── netlify.toml                  # Routing config
├── .gitignore                    # Keeps .env out of git
└── netlify/
    └── functions/
        └── recommend.js          # Serverless proxy (API key lives here via env var)
```
