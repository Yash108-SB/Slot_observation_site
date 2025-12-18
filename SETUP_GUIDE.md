# 🚀 Setup Guide for New Laptop

This guide will help you set up the Slot Observation Application on a new laptop with Docker Desktop already installed.

## 📋 Prerequisites

Before starting, ensure you have:

1. ✅ **Docker Desktop** - Already installed and running
2. ✅ **Git** - To clone the repository
3. ✅ **Node.js** - Version 18 or higher ([Download here](https://nodejs.org/))
4. ✅ **Code Editor** - VS Code recommended ([Download here](https://code.visualstudio.com/))

## 🔧 Installation Steps

### Step 1: Verify Docker Desktop

Open PowerShell and verify Docker is running:

```powershell
docker --version
docker-compose --version
```

You should see version numbers for both commands.

### Step 2: Clone or Copy the Project

**Option A: If using Git**
```powershell
git clone <your-repository-url>
cd slot_observation
```

**Option B: If copying files**
- Copy the entire `slot_observation` folder to your new laptop
- Open PowerShell and navigate to the project folder:
```powershell
cd C:\path\to\slot_observation
```

### Step 3: Configure Environment Variables

1. Navigate to the backend folder:
```powershell
cd backend
```

2. Create a `.env` file by copying the example:
```powershell
Copy-Item .env.example .env
```

3. Edit the `.env` file with your settings (use Notepad or VS Code):
```powershell
notepad .env
```

**Required configurations:**
- Database settings (default values work out of the box)
- Email settings (optional, only needed for automated reports)

**Default `.env` content:**
```env
# Database Configuration
DATABASE_HOST=127.0.0.1
DATABASE_PORT=54321
DATABASE_USER=slotuser
DATABASE_PASSWORD=password123
DATABASE_NAME=slot_observation

# Email Configuration (Optional - for automated reports)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
REPORT_EMAIL=admin@example.com
```

4. Return to the project root:
```powershell
cd ..
```

### Step 4: Start PostgreSQL Database

From the project root directory, start the database using Docker Compose:

```powershell
docker-compose up -d
```

**Verify the database is running:**
```powershell
docker ps
```

You should see `slot_observation_db` container running.

### Step 5: Install Backend Dependencies

```powershell
cd backend
npm install
```

This will install all required Node.js packages for the NestJS backend.

### Step 6: Install Frontend Dependencies

Open a new PowerShell window and navigate to the frontend folder:

```powershell
cd C:\path\to\slot_observation\frontend
npm install
```

This will install all required Node.js packages for the Next.js frontend.

### Step 7: Start the Application

**Terminal 1 - Backend (keep this running):**
```powershell
cd backend
npm run start:dev
```

Wait until you see: `Application is running on: http://localhost:3001`

**Terminal 2 - Frontend (keep this running):**
```powershell
cd frontend
npm run dev
```

Wait until you see: `ready started server on 0.0.0.0:3000`

### Step 8: Access the Application

Open your web browser and navigate to:

- **Frontend Application:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:3001](http://localhost:3001)
- **API Health Check:** [http://localhost:3001/database/health](http://localhost:3001/database/health)

## 🎯 Quick Start Commands

### Daily Usage

**Start everything:**
```powershell
# Terminal 1 - Database (if not already running)
docker-compose up -d

# Terminal 2 - Backend
cd backend
npm run start:dev

# Terminal 3 - Frontend
cd frontend
npm run dev
```

**Stop everything:**
```powershell
# Stop backend: Press Ctrl+C in backend terminal
# Stop frontend: Press Ctrl+C in frontend terminal

# Stop database
docker-compose down
```

## 🛠️ Troubleshooting

### Issue: "Port already in use"

**Backend port 3001 conflict:**
```powershell
# Find process using port 3001
netstat -ano | findstr :3001

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**Frontend port 3000 conflict:**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID> /F
```

**Database port 54321 conflict:**
```powershell
# Find process using port 54321
netstat -ano | findstr :54321

# Kill the process or stop existing Docker container
docker stop slot_observation_db
docker-compose down
docker-compose up -d
```

### Issue: Docker not starting

1. Open Docker Desktop application
2. Wait for it to fully start (whale icon in system tray)
3. Ensure WSL 2 is enabled (Docker Desktop settings)

### Issue: "npm install" fails

1. **Clear npm cache:**
```powershell
npm cache clean --force
```

2. **Delete node_modules and try again:**
```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

3. **Check Node.js version:**
```powershell
node --version
```
Should be v18.x or higher.

### Issue: Database connection fails

1. **Check if database is running:**
```powershell
docker ps
```

2. **View database logs:**
```powershell
docker logs slot_observation_db
```

3. **Restart database:**
```powershell
docker-compose down
docker-compose up -d
```

4. **Verify .env file settings match docker-compose.yml:**
- HOST: `127.0.0.1` or `localhost`
- PORT: `54321`
- USER: `slotuser`
- PASSWORD: `password123`
- DATABASE: `slot_observation`

### Issue: Frontend can't connect to backend

1. **Check backend is running on port 3001:**
```powershell
netstat -ano | findstr :3001
```

2. **Test backend health:**
Open browser: http://localhost:3001/database/health

3. **Check CORS settings** - Backend should allow localhost:3000

### Issue: "Command not found" errors

**npm not found:**
- Install Node.js from [nodejs.org](https://nodejs.org/)
- Restart PowerShell after installation

**docker not found:**
- Install Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/)
- Ensure it's running before executing docker commands

## 📦 Package Versions Reference

### Backend (NestJS)
- Node.js: v18+ or v20+
- NestJS: v10.x
- TypeORM: v0.3.x
- PostgreSQL: 15 (via Docker)

### Frontend (Next.js)
- Node.js: v18+ or v20+
- Next.js: v14.x
- React: v18.x
- TypeScript: v5.x

## 🔒 Security Notes

1. **Change default database password** in production
2. **Never commit `.env` files** to version control
3. **Use strong passwords** for production databases
4. **Enable email security** (use app passwords for Gmail)

## 📊 Database Management

### View database data:
You can connect to PostgreSQL using:

**Using Docker exec:**
```powershell
docker exec -it slot_observation_db psql -U slotuser -d slot_observation
```

**Using external tools:**
- **pgAdmin**: [Download here](https://www.pgadmin.org/)
- **DBeaver**: [Download here](https://dbeaver.io/)

Connection details:
- Host: `localhost`
- Port: `54321`
- Database: `slot_observation`
- Username: `slotuser`
- Password: `password123`

### Reset database:
```powershell
docker-compose down -v
docker-compose up -d
```

## 🎨 Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload. Changes are reflected automatically.

2. **Backend Logs**: Terminal 1 shows all API requests and database queries.

3. **Frontend Logs**: Terminal 2 shows Next.js build information and errors.

4. **Browser Console**: Press F12 to see frontend errors and network requests.

## 📞 Need Help?

If you encounter issues not covered here:

1. Check the main [README.md](README.md) for project details
2. Review [SECURITY_GUIDE.md](SECURITY_GUIDE.md) for security features
3. Check Docker Desktop logs in the Dashboard
4. Ensure all prerequisites are properly installed

## ✅ Verification Checklist

Before reporting issues, verify:

- [ ] Docker Desktop is running
- [ ] Node.js v18+ is installed (`node --version`)
- [ ] npm is installed (`npm --version`)
- [ ] Database container is running (`docker ps`)
- [ ] Backend is running on port 3001
- [ ] Frontend is running on port 3000
- [ ] `.env` file exists in backend folder
- [ ] All npm dependencies are installed

## 🎉 Success!

If everything is working:
- You should see the application at http://localhost:3000
- The database management card should show "Connected"
- You can create and view slot observations

Happy coding! 🚀
