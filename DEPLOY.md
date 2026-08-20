# Deploy (cheapest real server: Oracle Free VM + MySQL + Caddy)

One small Ubuntu VM serves everything on a single domain: the built Vue app as static
files, and the Express API under `/api`, both behind Caddy (automatic HTTPS). Same origin,
so no CORS. Total cost: the server is free, only the domain is paid (~R$5–10 for a `.xyz`).

Replace `yourdomain.com` everywhere with your real domain.

## 1. Create the VM
- Oracle Cloud → **Always Free** compute instance, **Ubuntu 22.04**.
- In the instance's **subnet security list**, allow ingress on **TCP 80** and **443** from `0.0.0.0/0`.
- Note the VM's **public IP**.

## 2. Point DNS at the VM
- At your registrar (or Cloudflare), add an **A record**: `yourdomain.com` → the VM's public IP.
- If using Cloudflare, set the record to **DNS only** (grey cloud) for the first Caddy cert, then you can proxy later.

## 3. SSH in and install the stack
```bash
ssh ubuntu@<VM_PUBLIC_IP>

# Node 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git

# MySQL
sudo apt-get install -y mysql-server
sudo systemctl enable --now mysql

# Caddy
sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt-get update && sudo apt-get install -y caddy

# firewall (in addition to Oracle's security list)
sudo ufw allow OpenSSH && sudo ufw allow 80 && sudo ufw allow 443 && sudo ufw --force enable
```

## 4. Create the database
```bash
sudo mysql <<'SQL'
CREATE DATABASE kanji CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'kanji'@'localhost' IDENTIFIED BY 'CHANGE_ME_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON kanji.* TO 'kanji'@'localhost';
FLUSH PRIVILEGES;
SQL
```

## 5. Get the code
```bash
sudo git clone https://github.com/vmeirelle/kanji-app.git /opt/kanji-app
cd /opt/kanji-app
```

## 6. Build the backend
```bash
cd /opt/kanji-app/server
npm ci
cat > .env <<ENV
PORT=3000
ENVIRONMENT=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=kanji
DB_PASSWORD=CHANGE_ME_STRONG_PASSWORD
DB_NAME=kanji
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRATION_SECONDS=604800
CORS_ORIGINS=https://yourdomain.com
ENV
npm run build
```
`ENVIRONMENT=development` lets TypeORM auto-create the `users`/`rankings` tables on first
boot. After the first successful start you may set it to `production` and restart (schema
stays; auto-sync turns off).

## 7. Build the frontend (served from domain root)
```bash
cd /opt/kanji-app
npm ci
VITE_BASE=/ npm run build   # outputs /opt/kanji-app/dist
```
Leaving `VITE_API_URL` unset makes the app call `/api/*` on the same origin — exactly what
Caddy proxies.

## 8. Run the API as a service
```bash
sudo useradd -r -s /usr/sbin/nologin kanji || true
sudo chown -R kanji:kanji /opt/kanji-app
sudo cp /opt/kanji-app/deploy/kanji-api.service /etc/systemd/system/kanji-api.service
sudo systemctl daemon-reload
sudo systemctl enable --now kanji-api
sudo systemctl status kanji-api --no-pager
curl -s localhost:3000/health   # -> {"status":"ok"}
```

## 9. Serve it with Caddy
```bash
sudo cp /opt/kanji-app/deploy/Caddyfile /etc/caddy/Caddyfile
sudo sed -i 's/yourdomain.com/YOURREALDOMAIN/' /etc/caddy/Caddyfile
sudo systemctl reload caddy
```
Caddy fetches a Let's Encrypt certificate automatically once DNS resolves.

## 10. Test end-to-end
Open `https://yourdomain.com` → Settings → Create account → play a **Ranked** round →
**Save to ranking** → the score appears on the board under your username.

## Updating later
```bash
cd /opt/kanji-app && sudo git pull
cd server && npm ci && npm run build && sudo systemctl restart kanji-api
cd /opt/kanji-app && npm ci && VITE_BASE=/ npm run build
```

## Notes
- The frontend on GitHub Pages is now redundant; this VM is the real site. You can leave
  Pages as-is or disable the workflow.
- Backups: `mysqldump kanji > kanji-$(date +%F).sql` on a cron if you want them.
