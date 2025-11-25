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

**Current Solution:**
- Client fetches business data (with auth) and passes it to API route
- API route uses client-provided data to avoid server-side Firestore calls
- Rules temporarily allow server-side reads (`request.auth == null`) for API routes
- Application-level security: API verifies `business.ownerUid === userId` before processing

**⚠️ IMPORTANT - Security Note:**
The rules currently allow server-side reads (`request.auth == null`) as a temporary workaround. This is **less secure** than proper authentication. For production:
- Use Firebase Admin SDK for server-side operations
- OR move all Firestore calls to client-side
- OR implement proper token verification

