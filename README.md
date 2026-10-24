# Keepsake

Save the websites, apps and prompts you find, so you can find them again.
Data is stored in your browser (localStorage). No account, no server.

## Run on your computer
    npm install
    npm run dev          (opens http://localhost:5173)

## Put it online (Vercel)
1. Create a new GitHub repository and upload everything in this folder
   (NOT node_modules, NOT .env.local).
2. On vercel.com: Add New > Project > import the repository > Deploy.
   Vercel detects Vite by itself. No environment variables are needed.

## Add the real React Bits Pro "Black Hole"
The app runs with a built-in stand-in (src/components/BlackHoleFallback.jsx).
Home.jsx already uses it as <BlackHole /> (default settings, as in the docs),
so switching is one command and one changed line:
1. Copy .env.example to .env.local and paste your REACTBITS_LICENSE_KEY.
2. Open https://pro.reactbits.dev/docs/installation, step 2, copy the "registries"
   block and paste it into components.json (replace "registries": {}). It must
   include the Authorization header that uses REACTBITS_LICENSE_KEY.
3. Run: npx shadcn@latest add @reactbits-starter/black-hole-tw
   (answer yes if it asks to overwrite or install packages)
4. Note the file path it prints. In src/components/Home.jsx change the import line
   to that path, e.g.  import BlackHole from "@/components/ui/black-hole-tw";
5. npm run dev to check, then commit and push. Vercel redeploys by itself.
Optional props (docs): colors={["#ffffff", "#ffe629"]} tints the light white-to-yellow
to match this black/white/yellow theme. Default edge colour is purple.
Never upload .env.local to GitHub. Vercel does not need the key.

## Where data is stored
Collections, categories, items (and saved logins) are in this browser's
localStorage under the key "keepsake.v1". Passwords are NOT encrypted:
anyone who can open this browser profile, or any browser extension or malware
that can read the site's storage, can read them. Hiding is only visual.
Data does not sync between devices and is lost if you clear site data.
