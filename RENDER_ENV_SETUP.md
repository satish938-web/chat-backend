# Render Environment Variables Setup

## Required Environment Variables

Add these environment variables in your Render Dashboard:

### 1. Go to Render Dashboard
### 2. Select your `chat-backend` service
### 3. Go to "Environment" tab
### 4. Add these variables:

```
MONGODB_URI=mongodb+srv://satish1:L8j6rRGCcZhED8HZ@cluster0.uwpa6ac.mongodb.net/chat-app?retryWrites=true&w=majority
JWT_SECRET=production-secret-key-2024-satish-chat-app
FRONTEND_URL=https://frontend-chat1.onrender.com
NODE_ENV=production
```

### 5. Save and Deploy
### 6. Trigger Manual Deploy: "Deploy Latest Commit"

## Why This Is Needed

- **MONGODB_URI**: Your actual database connection string
- **JWT_SECRET**: Secret key for token generation
- **FRONTEND_URL**: Your frontend URL for CORS
- **NODE_ENV**: Set to production for proper error handling

## After Setting Environment Variables

1. **Database will connect** properly
2. **Login/Signup will work** with real users
3. **No more timeout errors**
4. **Full functionality** with real data

## Current Status

Without these environment variables, the app will continue running but:
- ✅ **Server works** (API endpoints respond)
- ✅ **Mock authentication** (for testing)
- ❌ **No real database** operations
- ❌ **Real users not visible**

## Test After Setup

Once environment variables are set:
1. **Register new users** (saves to database)
2. **Login with real credentials**
3. **See your real users** in chat list
4. **Full chat functionality**
