#!/bin/bash
set -euo pipefail
exec > /var/log/user-data.log 2>&1
export DEBIAN_FRONTEND=noninteractive
cd /tmp

# 1. Memoria swap extra (para poder compilar sin quedarse sin RAM)
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# 2. Paquetes, PostgreSQL y Node.js 22
apt-get update -y
apt-get install -y ca-certificates curl git postgresql
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

# 3. Base de datos
sudo -u postgres psql -c "CREATE USER asistencia_user WITH PASSWORD '${db_password}';"
sudo -u postgres psql -c "CREATE DATABASE asistencia_db OWNER asistencia_user;"

# 4. Codigo y variables de entorno
sudo -H -u ubuntu git clone --branch simon ${repo_url} /home/ubuntu/app

cat > /home/ubuntu/app/backend/.env <<'EOF'
PORT=3000
FRONTEND_URL=${frontend_url}
DATABASE_URL=postgresql://asistencia_user:${db_password}@localhost:5432/asistencia_db
DB_SYNCHRONIZE=true
JWT_SECRET=${jwt_secret}
JWT_EXPIRATION=24h
EOF
chown ubuntu:ubuntu /home/ubuntu/app/backend/.env
chmod 600 /home/ubuntu/app/backend/.env

# 5. Compilar
sudo -H -u ubuntu bash -c 'cd /home/ubuntu/app/backend && npm ci --include=dev && npm run build'

# 6. Servicio systemd (arranca solo y se reinicia si falla)
cat > /etc/systemd/system/backend.service <<'EOF'
[Unit]
Description=Backend NestJS
After=network.target postgresql.service

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/app/backend
EnvironmentFile=/home/ubuntu/app/backend/.env
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/main
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now backend
echo "BACKEND LISTO"
