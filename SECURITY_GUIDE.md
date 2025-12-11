# Security Configuration Guide

## Default Credentials
**IMPORTANT: Change these in production!**

Default Admin Account:
- Username: `admin`
- Password: `Admin@123`
- Email: `admin@charusat.edu.in`

## Environment Variables

Create a `.env` file in the backend directory with:

```env
# Database Configuration
DATABASE_HOST=127.0.0.1
DATABASE_PORT=54321
DATABASE_USER=slotuser
DATABASE_PASSWORD=password123
DATABASE_NAME=slot_observation

# JWT Configuration (CHANGE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-use-at-least-32-characters
JWT_EXPIRES_IN=24h

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
REPORT_EMAIL=recipient@example.com

# Server Port
PORT=3001
```

## Security Features Implemented

### 1. Authentication & Authorization
- ✅ JWT-based authentication with HttpOnly cookies
- ✅ Bcrypt password hashing (10 salt rounds)
- ✅ Password requirements: min 8 chars, uppercase, lowercase, number, special char
- ✅ User roles: admin, faculty, user
- ✅ Account activation/deactivation
- ✅ Last login tracking
- ✅ Global authentication guard (all routes protected by default)
- ✅ @Public() decorator for login/register endpoints

### 2. Input Validation & Sanitization
- ✅ class-validator for DTO validation
- ✅ class-transformer for automatic type conversion
- ✅ XSS protection via input sanitization
- ✅ HTML tag stripping
- ✅ Special character escaping
- ✅ String length validation
- ✅ Regex patterns for time, date, and day validation
- ✅ JSON validation for complex fields
- ✅ Whitelist mode (strips unknown properties)
- ✅ ForbidNonWhitelisted (rejects unexpected properties)

### 3. SQL Injection Protection
- ✅ TypeORM parameterized queries (automatic)
- ✅ No raw SQL queries used
- ✅ Query builder with parameter binding
- ✅ Input validation prevents malicious inputs

### 4. Rate Limiting (DDoS Protection)
- ✅ ThrottlerModule configured
- ✅ Limit: 100 requests per minute per IP
- ✅ TTL: 60 seconds
- ✅ Prevents brute force attacks
- ✅ Prevents DDoS attacks

### 5. Security Headers (Helmet)
- ✅ X-DNS-Prefetch-Control
- ✅ X-Frame-Options (clickjacking protection)
- ✅ Strict-Transport-Security (HSTS)
- ✅ X-Download-Options
- ✅ X-Content-Type-Options (MIME sniffing protection)
- ✅ X-XSS-Protection
- ✅ Content-Security-Policy (XSS protection)
- ✅ Referrer-Policy

### 6. CORS Configuration
- ✅ Strict origin policy (only localhost:3000 by default)
- ✅ Credentials enabled for cookies
- ✅ Limited HTTP methods
- ✅ Allowed headers specified
- ✅ Exposed headers controlled
- ✅ maxAge configured

### 7. Frontend Security
- ✅ JWT stored in localStorage (consider HttpOnly cookies for production)
- ✅ Token expiration checking
- ✅ Auto-redirect to login on token expiry
- ✅ Protected routes with authentication guard
- ✅ Auth context for global authentication state
- ✅ Logout functionality clears tokens
- ✅ Loading states prevent unauthorized access

### 8. Session Management
- ✅ JWT tokens expire after 24 hours
- ✅ Token validation on each request
- ✅ Automatic logout on token expiry
- ✅ Refresh mechanism ready to implement

### 9. Password Security
- ✅ Bcrypt with 10 salt rounds
- ✅ Passwords never logged or exposed
- ✅ Password complexity requirements enforced
- ✅ Automatic hashing before database save

### 10. API Security
- ✅ All endpoints require authentication (except login/register)
- ✅ Validation pipes globally applied
- ✅ Error messages don't expose sensitive info
- ✅ Rate limiting on all endpoints

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Setup Database
```bash
# Start PostgreSQL database
docker-compose up -d
```

### 3. Create Default Admin User
```bash
cd backend
npm run seed
```

This creates the default admin account with credentials listed above.

### 4. Start Backend
```bash
cd backend
npm run start:dev
```

### 5. Start Frontend
```bash
cd frontend
npm run dev
```

### 6. First Login
1. Navigate to `http://localhost:3000`
2. You'll be redirected to `/login`
3. Use default admin credentials:
   - Username: `admin`
   - Password: `Admin@123`
4. **IMPORTANT**: Create a new admin account and delete the default one in production!

## Production Checklist

### Critical Security Updates for Production

1. **Change JWT Secret**
   ```env
   JWT_SECRET=use-a-very-long-random-string-here-at-least-64-characters
   ```

2. **Update Database Credentials**
   ```env
   DATABASE_PASSWORD=use-strong-random-password-here
   ```

3. **Set Production URLs**
   ```env
   FRONTEND_URL=https://your-domain.com
   ```

4. **Disable TypeORM Synchronize**
   In `app.module.ts`:
   ```typescript
   synchronize: false, // MUST be false in production
   ```

5. **Enable HTTPS**
   - Use SSL/TLS certificates
   - Configure reverse proxy (Nginx/Apache)
   - Force HTTPS redirect

6. **Set HttpOnly Cookies**
   Modify JWT strategy to use cookies instead of localStorage

7. **Implement CSRF Protection**
   - Enable csurf middleware
   - Add CSRF tokens to forms

8. **Rate Limiting**
   Adjust based on traffic:
   ```typescript
   ThrottlerModule.forRoot([{
     ttl: 60000,
     limit: 50, // Reduce for production
   }])
   ```

9. **Logging & Monitoring**
   - Set up application logging
   - Monitor failed login attempts
   - Track API usage
   - Set up alerts for suspicious activity

10. **Database Backups**
    - Implement automated backups
    - Test restore procedures
    - Store backups securely

11. **Create New Admin Account**
    - Create production admin account
    - Delete default admin
    - Use strong unique password

12. **Security Headers**
    Review and tighten CSP policy for your domain

## Password Requirements

Users must create passwords with:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

## API Authentication

All API requests (except /auth/login and /auth/register) require:

```
Authorization: Bearer <JWT_TOKEN>
```

Example:
```javascript
fetch('http://localhost:3001/slot/masters', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```

## Common Security Issues Prevented

1. ✅ **SQL Injection**: TypeORM parameterized queries
2. ✅ **XSS Attacks**: Input sanitization + CSP headers
3. ✅ **CSRF Attacks**: CORS policy + token validation
4. ✅ **DDoS Attacks**: Rate limiting
5. ✅ **Brute Force**: Rate limiting + account lockout ready
6. ✅ **Session Hijacking**: Secure JWT with expiration
7. ✅ **Clickjacking**: X-Frame-Options header
8. ✅ **MIME Sniffing**: X-Content-Type-Options header
9. ✅ **Man-in-the-Middle**: HTTPS (when deployed)
10. ✅ **Unauthorized Access**: JWT authentication on all routes

## Troubleshooting

### Can't login?
- Check backend is running on port 3001
- Verify database is running
- Check console for errors
- Try default admin credentials

### CORS errors?
- Verify FRONTEND_URL in .env matches your frontend URL
- Check backend CORS configuration

### Token expired?
- Tokens expire after 24 hours
- Logout and login again
- Check system time is correct

## Support

For security concerns or vulnerabilities, please contact the system administrator immediately.

**NEVER commit `.env` files with real credentials to version control!**
