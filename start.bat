@echo off
echo Starting MongoDB...
start cmd /k "start-mongodb.bat"

echo Waiting for MongoDB to start...
timeout /t 5

echo Starting Backend...
cd %~dp0
start cmd /k "mvnw.cmd spring-boot:run"

echo Starting Frontend...
cd client
start cmd /k "npm run dev"

echo All services started!
echo Backend: http://localhost:8080/api
echo Frontend: http://localhost:5173 