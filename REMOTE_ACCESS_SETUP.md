# Remote Access Configuration Guide

## Configuration Complete! ✅

The application has been configured for remote access on IP: **172.16.5.200**

## What Was Changed:

1. **Backend (.env)**
   - Added SERVER_IP=172.16.5.200
   - Added FRONTEND_URL configuration
   - Backend now listens on all network interfaces (0.0.0.0)

2. **Frontend (.env.local)**
   - Created with NEXT_PUBLIC_API_URL=http://172.16.5.200:3001
   - Frontend will connect to backend via network IP

3. **CORS Configuration**
   - Updated to allow connections from 172.16.5.200

## How to Start:

### Option 1: Using Startup Script (Recommended)
```powershell
cd C:\Users\Administrator\Desktop\slot_observation\Slot_observation_site
.\start-remote.ps1
```

### Option 2: Manual Start

**Terminal 1 - Backend:**
```powershell
cd C:\Users\Administrator\Desktop\slot_observation\Slot_observation_site\backend
npm run start:dev
```

**Terminal 2 - Frontend:**
```powershell
cd C:\Users\Administrator\Desktop\slot_observation\Slot_observation_site\frontend
npm run dev -- -H 0.0.0.0
```

## Firewall Configuration:

Run these commands as Administrator to allow network access:

```powershell
# Allow Node.js through Windows Firewall
New-NetFirewallRule -DisplayName "Node.js Backend (Port 3001)" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Next.js Frontend (Port 3000)" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

## Access URLs:

- **From Server (Local):** http://localhost:3000
- **From Network:** http://172.16.5.200:3000
- **Backend API:** http://172.16.5.200:3001

## Login Credentials:

- Username: **admin**
- Password: **Admin@123**

## Troubleshooting:

### If you can't access from other computers:

1. **Check Windows Firewall:**
   ```powershell
   Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*Node*"}
   ```

2. **Verify Server IP:**
   ```powershell
   ipconfig
   ```
   Confirm 172.16.5.200 is correct

3. **Test Backend Access:**
   From another computer, open browser to: http://172.16.5.200:3001/auth/login
   Should see "Cannot GET /auth/login" (this is normal - means backend is accessible)

4. **Check if ports are listening:**
   ```powershell
   netstat -an | findstr "3000 3001"
   ```

### If backend won't start:

- Make sure PostgreSQL 17 is running
- Check database credentials in backend/.env
- Verify no other application is using ports 3000 or 3001

## Network Requirements:

- Server must be on same network as client computers
- No proxy blocking ports 3000 or 3001
- Windows Firewall rules configured (see above)

## Support:

If issues persist:
1. Check backend terminal for errors
2. Check frontend terminal for errors  
3. Check browser console (F12) for JavaScript errors
4. Verify both services are running: `netstat -an | findstr "3000 3001"`
