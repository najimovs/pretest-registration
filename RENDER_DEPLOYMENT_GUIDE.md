# Render.com Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Repository Setup
- Ensure your backend code is in the `backend/` directory
- Make sure `.env` is in `.gitignore` (never commit it!)
- Push your code to GitHub

### 2. Render Service Configuration

#### Service Settings:
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`
- **Node Version**: 18 or higher
- **Root Directory**: Leave empty (or set to `/`)

#### Environment Variables (Set these in Render Dashboard):
```
MONGODB_URI=mongodb+srv://registration-pretest:pretest2025@cluster0.wunm9gg.mongodb.net/ielts-registration?retryWrites=true&w=majority&appName=Cluster0
NODE_ENV=production
PORT=8000
JWT_SECRET=change-this-super-secret-jwt-key-in-production-minimum-32-chars
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2a$12$FZ0vtDci7n6hR3iW3lLRIemcpRlzXrUgnRqR6XAIC5BbFdaDsb2aK
CLICK_SERVICE_ID=82886
CLICK_MERCHANT_ID=46111
CLICK_SECRET_KEY=9TDkmspVHm7LZ
CLICK_MERCHANT_USER_ID=64082
DOMAIN=pretest-uzbekistan.uz
TEST_AMOUNT=100
FRONTEND_URL=https://pretest-uzbekistan.uz
ADMIN_PANEL_URL=https://whimsical-sprite-8f17d6.netlify.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CLICK_ALLOWED_IPS=185.8.212.184,185.8.212.185,185.8.212.186
STRICT_IP_VALIDATION=false
```

### 3. Common Issues & Solutions

#### Issue: "Module not found" errors
**Solution**:
- Check that all imports use `.js` extensions
- Verify file paths are correct
- Ensure `"type": "module"` is in package.json

#### Issue: "Cannot find package.json"
**Solution**:
- Use build command: `cd backend && npm install`
- Use start command: `cd backend && npm start`

#### Issue: Database connection fails
**Solution**:
- Verify MONGODB_URI is correctly set in environment variables
- Check MongoDB Atlas allows connections from 0.0.0.0/0
- Ensure database user has read/write permissions

#### Issue: Port binding errors
**Solution**:
- Use `process.env.PORT` in your server code
- Don't hardcode port numbers
- Render automatically assigns a port

#### Issue: Build timeouts
**Solution**:
- Increase build timeout in Render settings
- Remove unnecessary devDependencies
- Use `npm ci` instead of `npm install` for faster builds

### 4. Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Environment variables set in Render
- [ ] Build command: `cd backend && npm install`
- [ ] Start command: `cd backend && npm start`
- [ ] Node version 18+
- [ ] MongoDB URI accessible
- [ ] No hardcoded ports or URLs
- [ ] All imports have .js extensions
- [ ] .env file in .gitignore

### 5. Health Check

After deployment, test these endpoints:
- `https://your-app.onrender.com/api/health`
- Should return: `{"success":true,"message":"IELTS Registration API is running"}`

### 6. Debugging

Check Render logs for:
- Environment variable loading
- Database connection status
- Port binding
- Module resolution errors

### 7. Production Security

Remember to:
- Generate a strong JWT_SECRET
- Update admin credentials
- Use real Click payment credentials
- Enable MongoDB IP whitelist if needed
- Review CORS origins for production domains

## 🆘 Common Error Messages

### "ERR_MODULE_NOT_FOUND"
- Add `.js` extensions to all import statements
- Check file paths are correct

### "Cannot read properties of undefined"
- Environment variables not set
- Check Render environment variable configuration

### "listen EADDRINUSE"
- Don't hardcode ports
- Use `process.env.PORT || 8000`

### "MongooseServerSelectionError"
- MongoDB URI incorrect
- Database not accessible
- Check MongoDB Atlas network access

## 📞 Support

If deployment still fails:
1. Check Render build logs
2. Verify all environment variables
3. Test locally with production environment
4. Check database connectivity
5. Review CORS configuration

## 🔄 Re-deployment

After fixing issues:
1. Push changes to GitHub
2. Render will auto-deploy
3. Or manually trigger deployment in Render dashboard
4. Monitor logs during deployment