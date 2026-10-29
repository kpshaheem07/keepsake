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
- Export PDF: on Home (everything or one category) or inside a category.
  Passwords are left out unless you tick "Include passwords". The Private lock is never exported.
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
- Images are shrunk and kept inside the database (Firebase file storage needs a paid plan since Feb 2026). One small image per item.
- Needs internet to sync. Without internet the app shows the last saved copy and uploads changes later.
- If two devices change the same Private lock at the same moment, the last save wins.
