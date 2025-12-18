# Migration Script: Transfer database from Docker to Local PostgreSQL
# Make sure to replace <YOUR_POSTGRES_PASSWORD> with your actual postgres user password

$POSTGRES_PASSWORD = Read-Host "Enter your local PostgreSQL 'postgres' user password" -AsSecureString
$POSTGRES_PASSWORD_TEXT = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($POSTGRES_PASSWORD))

Write-Host "Step 1: Creating backup from Docker PostgreSQL..." -ForegroundColor Green
docker exec -e PGPASSWORD=password123 slot_observation_db pg_dump -U slotuser -d slot_observation -F c -f /tmp/slot_observation_backup.dump

Write-Host "Step 2: Copying backup to local machine..." -ForegroundColor Green
docker cp slot_observation_db:/tmp/slot_observation_backup.dump .\slot_observation_backup.dump

Write-Host "Step 3: Creating user and database in local PostgreSQL..." -ForegroundColor Green
$env:PGPASSWORD = $POSTGRES_PASSWORD_TEXT

# Create user if not exists
psql -U postgres -h localhost -p 5432 -d postgres -c "CREATE USER slotuser WITH PASSWORD 'password123';" 2>$null

# Create database
psql -U postgres -h localhost -p 5432 -d postgres -c "CREATE DATABASE slot_observation OWNER slotuser;"

Write-Host "Step 4: Restoring backup to local PostgreSQL..." -ForegroundColor Green
pg_restore -U postgres -h localhost -p 5432 -d slot_observation --no-owner --no-privileges .\slot_observation_backup.dump

Write-Host "Step 5: Granting permissions..." -ForegroundColor Green
psql -U postgres -h localhost -p 5432 -d slot_observation -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO slotuser;"
psql -U postgres -h localhost -p 5432 -d slot_observation -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO slotuser;"

Write-Host "Migration completed successfully!" -ForegroundColor Green
Write-Host "Database has been transferred from Docker to local PostgreSQL on port 5432" -ForegroundColor Yellow
