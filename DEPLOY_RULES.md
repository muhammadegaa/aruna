# Deploy Firestore Rules

## Important: Rules Must Be Deployed to Firebase Console

The `firestore.rules` file in this repo contains the security rules, but **they must be deployed to Firebase Console** for them to take effect.

## Steps to Deploy:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `aruna-830bb`
3. Navigate to **Firestore Database** → **Rules**
4. Copy the contents of `firestore.rules` from this repo
5. Paste into the rules editor
6. Click **Publish**

## Current Rules Summary:

- ✅ Users can only read/write their own businesses
- ✅ All subcollections (entities, transactions, config, metricsDaily) are protected
- ✅ Authentication required for all operations

## Note on Server-Side API Routes:

The API routes run server-side and don't have automatic authentication context. The rules require `request.auth != null`, which only works for client-side calls.

**Current Workaround:**
- Client passes `userId` to API route
- API route verifies `business.ownerUid === userId` before processing
- This provides application-level security, but Firestore rules still need to be deployed

**For Production:**
Consider using Firebase Admin SDK for server-side operations to properly authenticate Firestore calls.

