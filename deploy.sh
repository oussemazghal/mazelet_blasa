#!/bin/bash
set -e

# --- Configuration ---
DB_NAME="football"
DB_USER="postgres"
DB_PASS="oussema55"
PROJECT_DIR="/home/azureuser/serviceweb"
BACKEND_DIR="$PROJECT_DIR/apis"
FRONTEND_DIR="$PROJECT_DIR/aa"
VENV_DIR="$PROJECT_DIR/venv"

# 1. --- SWAP SETUP (Vital pour 1GB RAM) ---
echo "--- Checking Swap ---"
if [ $(swapon --show | wc -l) -eq 0 ]; then
    echo "Creating 2GB swap file..."
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "Swap created."
else
    echo "Swap already exists."
fi

# 2. --- SYSTEM DEPENDENCIES ---
echo "--- Installing Dependencies ---"
sudo apt-get update
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs python3-full python3-pip python3-venv nginx postgresql postgresql-contrib acl git

# 3. --- DATABASE SETUP ---
echo "--- Setting up Database ---"
sudo service postgresql start
# Set password for default user 'postgres'
sudo -u postgres psql -c "ALTER USER postgres PASSWORD '$DB_PASS';"
# Create database if not exists
if ! sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    sudo -u postgres createdb $DB_NAME
    echo "Database '$DB_NAME' created."
else
    echo "Database '$DB_NAME' already exists."
fi

# Patch Python config to use standard port 5432 instead of 4443
sed -i 's/:4443/:5432/g' "$BACKEND_DIR/app/database.py"

# 4. --- BACKEND SETUP ---
echo "--- Setting up Backend ---"
if [ ! -d "$VENV_DIR" ]; then
    python3 -m venv "$VENV_DIR"
fi
source "$VENV_DIR/bin/activate"
pip install --upgrade pip
pip install -r "$BACKEND_DIR/requirements.txt"

# Create Systemd Service
echo "--- Creating Systemd Service ---"
sudo bash -c "cat > /etc/systemd/system/serviceweb.service" <<EOL
[Unit]
Description=Gunicorn instance to serve ServiceWeb API
After=network.target

[Service]
User=azureuser
Group=www-data
WorkingDirectory=$PROJECT_DIR
Environment="PATH=$VENV_DIR/bin"
ExecStart=$VENV_DIR/bin/uvicorn apis.app.main:app --host 127.0.0.1 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
EOL

sudo systemctl daemon-reload
sudo systemctl enable serviceweb
sudo systemctl restart serviceweb

# 5. --- FRONTEND SETUP ---
echo "--- Setting up Frontend ---"
cd "$FRONTEND_DIR"
npm install
npm run build
cd "$PROJECT_DIR"

# 6. --- NGINX SETUP ---
echo "--- Configuring Nginx ---"
sudo bash -c "cat > /etc/nginx/sites-available/default" <<EOL
server {
    listen 80;
    server_name _;  # Catch-all

    root $FRONTEND_DIR/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

     # Proxy requests for /redoc and /docs to FastAPI as well
    location ~ ^/(docs|redoc|openapi.json) {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOL

sudo nginx -t
sudo systemctl restart nginx

echo "--- DEPLOYMENT COMPLETE ---"
echo "Web URL: http://$(curl -s ifconfig.me)"
