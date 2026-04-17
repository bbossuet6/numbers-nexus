# Numbers — A Harlem Dynasty

A browser-based narrative idle game. 12 generations, 1921–2040. Built on the Nexus Engine.

## Deploy to Netlify (10 minutes)

### Step 1: Create a GitHub repo

1. Go to github.com, click **New repository**
2. Name it `numbers-nexus` (or whatever you want)
3. Leave it **public** or **private**, doesn't matter
4. Don't initialize with a README
5. Click **Create repository**

### Step 2: Upload these files to the repo

**Easiest way (no terminal):**

1. On the new empty repo page, click **uploading an existing file**
2. Drag ALL the files from this folder into the upload zone
   - Including the `src/` folder, `public/` folder, and all config files
3. Scroll down, click **Commit changes**

### Step 3: Connect to Netlify

1. Go to netlify.com, sign in (you can use GitHub to sign in)
2. Click **Add new site** → **Import an existing project**
3. Click **Deploy with GitHub**
4. Authorize Netlify if prompted
5. Pick your `numbers-nexus` repo
6. Netlify auto-detects Vite. Just click **Deploy**
7. Wait ~90 seconds for the first build

You'll get a URL like `something-random-12345.netlify.app`. Click **Site configuration** to rename it to something like `numbers-nexus.netlify.app`.

### Step 4: Add to your home screen

**On iPhone:**
1. Open the site in **Safari** (not Chrome — Safari is required for PWA on iOS)
2. Tap the **Share** button (box with arrow pointing up)
3. Scroll down, tap **Add to Home Screen**
4. Name it "Numbers" and tap **Add**

**On Android:**
1. Open the site in **Chrome**
2. Tap the **⋮** menu (top right)
3. Tap **Install app** or **Add to Home screen**
4. Confirm

The app will launch full-screen like a native app. No Safari/Chrome chrome, custom icon, standalone mode.

### Future updates

When you want to deploy updates:
1. Drag updated files into the GitHub repo (replacing old ones)
2. Netlify auto-detects the commit and redeploys in ~60 seconds
3. Your home screen app updates the next time you open it

## Local development (optional)

If you want to run this locally before deploying:

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## Saves

Saves persist in `localStorage` — they survive closing the app, closing the browser, and restarting your phone. They're tied to the domain, so if Netlify changes your URL, you'll lose saves (just rename once and don't change it again).

Three save slots. Autosave every 60 seconds to Slot 1.
