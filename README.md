# 🎰 Slot Observation Application

A modern, full-stack web application for managing and analyzing slot observations with a beautiful UI built using shadcn/ui components and 21st.dev design principles.

![Tech Stack](https://img.shields.io/badge/Next.js-14-black)
![NestJS](https://img.shields.io/badge/NestJS-10-red)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## ✨ Features

### 🗄️ Database Management Module
- Real-time database connection monitoring
- Live table listing and information
- Connection status with visual indicators
- Automatic refresh capability

### ➕ Slot Entry Module
- Comprehensive form for creating slot observations
- Inline editing of existing entries
- Delete functionality with confirmation
- Recent observations list
- Full validation on all fields

### 📊 Slot Analytics Module
- Key metrics dashboard (total slots, amounts, averages)
- Interactive bar charts for status distribution
- Pie charts for location distribution
- Detailed breakdowns and statistics
- Auto-refresh capability

### Manual Setup

```powershell
# 1. Start PostgreSQL
docker-compose up -d

# 2. Install and start backend
cd backend
npm install
npm run start:dev

# 3. Install and start frontend (new terminal)
cd frontend
npm install
npm run dev
```

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **shadcn/ui** - Beautiful, accessible UI components
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Data visualization
- **Lucide Icons** - Modern icon library

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeORM** - Database ORM
- **PostgreSQL** - Relational database
- **Class Validator** - DTO validation

### Infrastructure
- **Docker** - PostgreSQL containerization
- **Docker Compose** - Service orchestration

## 📁 Project Structure

```
slot_observation/
├── backend/              # NestJS API
│   ├── src/
│   │   ├── database/    # Database management
│   │   ├── slot/        # CRUD operations
│   │   └── analytics/   # Statistics & charts
├── frontend/            # Next.js UI
│   ├── app/            # App router pages
│   ├── components/     # React components
│   │   ├── DatabaseManagementCard.tsx
│   │   ├── SlotEntryCard.tsx
│   │   ├── SlotAnalyticsCard.tsx
│   │   └── ui/         # shadcn/ui components
│   └── lib/            # Utilities & API
├── docker-compose.yml  # PostgreSQL setup
└── setup.ps1          # Automated setup
```

## 🎨 UI Components

Built with **shadcn/ui** components:
- Card, Button, Input, Select, Textarea
- Label, Toast notifications
- Fully customizable and accessible
- Beautiful animations and transitions

## 🔌 API Endpoints

### Slots
- `GET /slots` - List all observations
- `POST /slots` - Create observation
- `PATCH /slots/:id` - Update observation
- `DELETE /slots/:id` - Delete observation

### Database
- `GET /database/status` - Connection status
- `GET /database/tables` - List tables

### Analytics
- `GET /analytics/statistics` - Statistics
- `GET /analytics/recent` - Recent activity

## 🧪 Testing

1. Verify database connection in Database Management card
2. Create sample slot observations
3. Check analytics update in real-time
4. Test edit and delete functionality

## 🚨 Troubleshooting

### Database Issues
```powershell
# Check Docker
docker ps

# Restart database
docker-compose restart

# View logs
docker-compose logs -f
```

### Port Conflicts
- Frontend: Modify `package.json` dev script
- Backend: Change PORT in `.env`
- Database: Update `docker-compose.yml`

## 🎯 Key Highlights

✅ **Error-free setup** - Comprehensive validation and error handling  
✅ **Modern UI** - Beautiful design with shadcn/ui and Tailwind CSS  
✅ **Type-safe** - Full TypeScript implementation  
✅ **Real-time updates** - Live data synchronization  
✅ **Responsive design** - Works on all screen sizes  
✅ **Production-ready** - Best practices and patterns  

## 📝 License

MIT License - Free to use for learning and development

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Built with ❤️ using Next.js, NestJS, PostgreSQL, and shadcn/ui**
