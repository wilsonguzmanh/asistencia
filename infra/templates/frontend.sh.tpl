#!/bin/bash
set -euo pipefail
exec > /var/log/user-data.log 2>&1
export DEBIAN_FRONTEND=noninteractive
cd /tmp

# 1. Swap
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# 2. Paquetes, Nginx y Node.js 22
apt-get update -y
apt-get install -y ca-certificates curl git nginx
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

# 3. Codigo y variable del API (se incrusta al compilar)
sudo -H -u ubuntu git clone --branch simon ${repo_url} /home/ubuntu/app

cat > /home/ubuntu/app/frontend/.env.production <<'EOF'
NEXT_PUBLIC_API_URL=${backend_api}
EOF
chown ubuntu:ubuntu /home/ubuntu/app/frontend/.env.production

# 4. Compilar
sudo -H -u ubuntu bash -c 'cd /home/ubuntu/app/frontend && npm ci && npm run build'

# 5. Servicio systemd
cat > /etc/systemd/system/frontend.service <<'EOF'
[Unit]
Description=Frontend Next.js
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/app/frontend
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/npm run start
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now frontend

# 6. Nginx: puerto 80 -> Next.js en 3000
cat > /etc/nginx/sites-available/default <<'EOF'
server {
  listen 80 default_server;
  server_name _;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
EOF
systemctl restart nginx
echo "FRONTEND LISTO"
