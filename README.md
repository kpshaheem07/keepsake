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

## How the app works
Home: your own categories. Open one: your own sub-categories. Open one: a numbered
list (1, 2, 3) with + Add. Click a heading to see the big page with Copy buttons.
Bottom of Home: Private lock (encrypted area with its own categories).

## Where data is stored (this browser only)
- Normal data: localStorage key "keepsake.v2". NOT encrypted. Old "keepsake.v1" data is left untouched.
- Private lock: localStorage key "keepsake.vault.v1". Encrypted with AES-GCM.
  A random key encrypts the data. That key is saved twice: locked by your password
  and locked by your Recovery code (shown once). Either opens the lock.
- If you lose BOTH the password and the Recovery code, nobody can open the lock.
- The lock closes by itself when you leave the Private lock pages.
- Passwords in normal items are not encrypted. Use the Private lock for important secrets.
- Data does not sync between devices and is lost if you clear site data.
