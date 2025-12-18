# Database Migration to Remote PC (172.16.5.200)

## Prerequisites on Remote PC (172.16.5.200)
- PostgreSQL 17 installed
- Know the postgres superuser password

## Step 1: Transfer the Backup File
Copy `slot_observation_remote.dump` from this PC to the remote PC (172.16.5.200)

You can use one of these methods:
```powershell
# Method 1: Copy via network share
Copy-Item .\slot_observation_remote.dump \\172.16.5.200\C$\temp\

# Method 2: Use SCP if available
scp .\slot_observation_remote.dump username@172.16.5.200:/tmp/

# Method 3: Manually copy using USB drive or shared folder
```

## Step 2: On Remote PC - Create User and Database
Run these commands on the remote PC (172.16.5.200):

```powershell
# Create database user
$env:PGPASSWORD="<postgres_password>"; psql -U postgres -h localhost -p 5432 -d postgres -c "CREATE USER slotuser WITH PASSWORD 'password123';"

# Create database
$env:PGPASSWORD="<postgres_password>"; psql -U postgres -h localhost -p 5432 -d postgres -c "CREATE DATABASE slot_observation OWNER slotuser;"

# Restore the backup
$env:PGPASSWORD="<postgres_password>"; pg_restore -U postgres -h localhost -p 5432 -d slot_observation --no-owner --no-privileges C:\temp\slot_observation_remote.dump

# Grant permissions
$env:PGPASSWORD="<postgres_password>"; psql -U postgres -h localhost -p 5432 -d slot_observation -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO slotuser; GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO slotuser;"
```

## Step 3: Configure Remote PostgreSQL to Accept Network Connections

### A. Edit postgresql.conf
Location: `C:\Program Files\PostgreSQL\17\data\postgresql.conf`

Find and change:
```
listen_addresses = 'localhost'
```
To:
```
listen_addresses = '*'
```

### B. Edit pg_hba.conf
Location: `C:\Program Files\PostgreSQL\17\data\pg_hba.conf`

Add this line at the end:
```
# Allow connections from your network
host    slot_observation    slotuser    172.16.5.0/24    md5
# Or allow from specific IP (your PC)
host    slot_observation    slotuser    172.16.5.XXX/32  md5
```

### C. Restart PostgreSQL Service
```powershell
Restart-Service postgresql-x64-17
```

### D. Configure Windows Firewall
```powershell
# Allow PostgreSQL port 5432
New-NetFirewallRule -DisplayName "PostgreSQL" -Direction Inbound -Protocol TCP -LocalPort 5432 -Action Allow
```

## Step 4: Update Backend Configuration on This PC

The backend/.env file will be updated to:
```
DATABASE_HOST=172.16.5.200
DATABASE_PORT=5432
DATABASE_USER=slotuser
DATABASE_PASSWORD=password123
DATABASE_NAME=slot_observation
```

## Step 5: Test Connection from This PC

```powershell
# Test connection to remote database
$env:PGPASSWORD="password123"; psql -U slotuser -h 172.16.5.200 -p 5432 -d slot_observation -c "SELECT COUNT(*) FROM users;"
```

## Verification
Once connected, verify data:
```powershell
$env:PGPASSWORD="password123"; psql -U slotuser -h 172.16.5.200 -p 5432 -d slot_observation -c "\dt"
$env:PGPASSWORD="password123"; psql -U slotuser -h 172.16.5.200 -p 5432 -d slot_observation -c "SELECT username FROM users;"
```

## Security Notes
- Consider using a stronger password for production
- Only allow connections from specific IPs in pg_hba.conf
- Use SSL connections for production environments
- Keep PostgreSQL updated with security patches
