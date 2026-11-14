# Keepsake (Firebase version)

Your own categories -> sub-categories -> numbered items -> big detail page.
Data is saved in YOUR Firebase project (free Spark plan) and shows on every device after you sign in.

## Part A: publish the database rules (one time, in the Firebase website)
1. Open https://console.firebase.google.com/u/0/project/keepsake-1709b/firestore/rules
2. Delete everything in the box.
3. Open the file firestore.rules from this folder, copy all of it, paste it in the box.
4. Click Publish.
Without this step the app shows "Permission denied".

## Part B: put the code online
Upload everything in this folder to GitHub (Add file > Upload files > Commit changes).
Vercel updates the website by itself in about 2 minutes.

## How to use
- Sign in with the email and password you made in Firebase > Authentication > Users.
- Home: + Add category. Open one: + Add category again. Open one: numbered list, + Add.
- Click a heading for the big page with Copy buttons.
- Export PDF (categories only; Projects, Certificates and the Private lock are not included): on Home (everything or one category) or inside a category.
  Passwords are left out unless you tick "Include passwords". The Private lock is never exported.
- Download / Open / Share: Download saves the file on desktop and Android. On iPhone and iPad it opens the share menu (choose Save to Files). Open shows the file in a new tab. Android also has a Share button.
- Files: items, projects and certificates can each hold up to 5 files (PDF, TXT or images).
  Each file can be up to about 740 KB. Images are shrunk automatically. Files are NOT encrypted.
  Deleting an item also deletes its files. The Private lock has no file upload.
- My Projects (bottom of Home): name, details, tools, emails, login password, domain, storage system, link, note.
- My Certificates (bottom of Home): heading, ONE PDF or image, note. Open it, or press Download.
  Old single-file certificates still open; they move to the new way when you edit them.
- Private lock (bottom of Home): your own encrypted area. Make a password, SAVE THE RECOVERY CODE.
- If you see "Found data saved only on this device", press "Move my data to the cloud" once.
- Sign out removes the saved copy from this device.

## Security
- Database rules (firestore.rules): only the login with your UID can read or write. Everyone else is blocked.
- The Firebase "web config" in src/firebase.js is public by design. NEVER share a service account or private key.
- Normal items are readable by you in the Firebase website and by Google. Passwords in normal items are not encrypted.
- Private lock data is encrypted in your browser (AES-GCM) BEFORE it is sent. The cloud only has scrambled text.
  Lose both the password and the Recovery code = nobody can open it.

## Limits
- Free plan: about 50,000 reads and 20,000 writes per day.
- Files are kept inside the free database (Firebase Cloud Storage needs a paid plan). Each file is its own record, up to about 740 KB.
- Needs internet to sync. Without internet the app shows the last saved copy and uploads changes later.
- If two devices change the same Private lock at the same moment, the last save wins.
