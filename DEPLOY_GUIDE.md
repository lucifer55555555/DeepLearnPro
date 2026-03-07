# Final Steps for Global Deployment

The project is now fully prepared for global hosting. All technical curriculum has been integrated, and the production build has been verified locally.

## Step 1: Push to GitHub
I have already configured the local repository to point to your GitHub project. To overwrite the "old code" with the new curriculum, run these commands:

1. Open your terminal in the project directory.
2. Push the changes (Note: you will likely need the `-f` flag to overwrite the old history):
   ```bash
   git branch -M master
   git push -u origin master -f
   ```
   *Note: If you prefer to keep the old branch, you can push to a new branch like `git push -u origin feature-new-curriculum`.*

## Step 2: Deploy to Vercel (Recommended)
1. Go to [Vercel](https://vercel.com/new) and import your new GitHub repository.
2. **Environment Variables:** In the Vercel dashboard, add the following secrets:
   - `GEMINI_API_KEY`: Your Google AI Studio key.
   - `NEXT_PUBLIC_FIREBASE_API_KEY`: Found in `src/firebase/config.ts`.
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Found in `src/firebase/config.ts`.
   - ... (Add all other fields from `firebaseConfig` if they aren't already hardcoded).
3. Click **Deploy**.

## Step 3: Firebase Authorized Domains
Once your site is live (e.g., `deeplearn-pro.vercel.app`):
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Navigate to **Authentication > Settings > Authorized Domains**.
3. Add your new domain to the list to ensure login works in production.

---
**Build Status:** ✅ Local Production Build Passed
**Git Status:** ✅ Initialized and Committed
**Content:** ✅ DeepLearning.AI Curriculum Integrated
