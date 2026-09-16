# SHOGI Systems Preview - Deployment Guide

Complete instructions for deploying the SHOGI preview sites to production.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Generate SSL certificates (development only)
./generate-certs.sh   # Linux/Mac
generate-certs.bat    # Windows

# 3. Start server
npm start
```

Access sites at:
- https://localhost/enterprise-dashboard-preview
- https://localhost/policy-configuration-preview

---

## Production Deployment

### Option 1: Direct Server (VPS/Dedicated)

#### Prerequisites
- Ubuntu 20.04+ or similar Linux distribution
- Node.js 18+
- npm or yarn
- Valid SSL certificate from Let's Encrypt or your provider

#### Steps

1. **Provision Server**
   ```bash
   # Connect to server
   ssh root@your-server-ip
   
   # Update system
   apt update && apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   apt install -y nodejs
   ```

2. **Set Up Application**
   ```bash
   # Create app directory
   mkdir -p /var/www/shogi-preview
   cd /var/www/shogi-preview
   
   # Clone or copy project files
   git clone your-repo .
   
   # Install dependencies
   npm install --production
   ```

3. **Configure SSL Certificates**
   ```bash
   # Using Let's Encrypt with Certbot
   apt install certbot python3-certbot-nginx -y
   
   certbot certonly --standalone \
     -d shogisystems.com \
     -d www.shogisystems.com \
     --agree-tos \
     --email admin@shogisystems.com
   
   # Copy certificates
   cp /etc/letsencrypt/live/shogisystems.com/privkey.pem ./certs/private-key.pem
   cp /etc/letsencrypt/live/shogisystems.com/fullchain.pem ./certs/certificate.pem
   chmod 600 ./certs/*
   ```

4. **Set Up Process Manager (PM2)**
   ```bash
   npm install -g pm2
   
   # Start application
   pm2 start ecosystem.config.js --env production
   
   # Make it restart on reboot
   pm2 startup
   pm2 save
   
   # Monitor
   pm2 status
   pm2 logs shogi-preview
   ```

5. **Configure Firewall**
   ```bash
   ufw allow 22/tcp      # SSH
   ufw allow 80/tcp      # HTTP
   ufw allow 443/tcp     # HTTPS
   ufw enable
   ```

6. **Auto-Renew Certificates**
   ```bash
   # Certbot auto-renewal (runs twice daily)
   systemctl enable certbot.timer
   systemctl start certbot.timer
   ```

---

### Option 2: Using Nginx as Reverse Proxy

Better security and performance than direct Node.js exposure.

1. **Install Nginx**
   ```bash
   apt install nginx -y
   ```

2. **Add Nginx Configuration**
   ```bash
   # Copy the example configuration
   cp nginx.conf.example /etc/nginx/sites-available/shogisystems.com
   
   # Enable site
   ln -s /etc/nginx/sites-available/shogisystems.com \
         /etc/nginx/sites-enabled/
   
   # Remove default config
   rm /etc/nginx/sites-enabled/default
   
   # Test configuration
   nginx -t
   
   # Reload nginx
   systemctl reload nginx
   ```

3. **Configure Certbot for Nginx**
   ```bash
   certbot --nginx -d shogisystems.com -d www.shogisystems.com
   ```

4. **Start Node.js on Port 3000**
   ```bash
   # Modify server.js to use port 3000
   PORT=3000 pm2 start server.js --name shogi-preview
   pm2 save
   ```

---

### Option 3: Docker & Docker Compose

Containerized deployment with orchestration.

1. **Build Docker Image**
   ```bash
   docker build -t shogi-preview:latest .
   ```

2. **Run Container**
   ```bash
   # Create cert volume
   docker volume create shogi-certs
   
   # Run with volume mount
   docker run -d \
     --name shogi-preview \
     -p 443:443 \
     -v shogi-certs:/app/certs:ro \
     -e NODE_ENV=production \
     --restart unless-stopped \
     shogi-preview:latest
   ```

3. **Using Docker Compose** (Recommended)
   ```bash
   # Copy certificates to ./certs first
   docker-compose up -d
   
   # View logs
   docker-compose logs -f shogi-preview
   
   # Stop
   docker-compose down
   ```

4. **With Nginx Reverse Proxy**
   ```bash
   # Uncomment nginx service in docker-compose.yml
   docker-compose up -d
   
   # Access on port 80/443
   ```

---

### Option 4: Using Heroku, Railway, or Render

Cloud platform with automatic SSL.

#### Heroku Example

1. **Install Heroku CLI**
   ```bash
   curl https://cli-assets.heroku.com/install.sh | sh
   heroku login
   ```

2. **Deploy**
   ```bash
   # Create app
   heroku create shogi-preview
   
   # Deploy
   git push heroku main
   
   # View logs
   heroku logs --tail
   ```

3. **Configure Custom Domain**
   ```bash
   heroku domains:add shogisystems.com
   heroku certs:auto:enable
   ```

---

## DNS Configuration

Ensure your domain points to your server:

```
Type    Name                    Value
A       @                       your-server-ip
A       www                     your-server-ip
AAAA    @                       your-ipv6-address
AAAA    www                     your-ipv6-address
```

---

## Monitoring & Maintenance

### Health Checks

```bash
# Check if sites are accessible
curl -k https://shogisystems.com/enterprise-dashboard-preview
curl -k https://shogisystems.com/policy-configuration-preview

# Monitor process
pm2 status
pm2 logs shogi-preview
```

### Certificate Renewal

```bash
# Check certificate expiration
openssl x509 -in ./certs/certificate.pem -noout -dates

# Manually renew
certbot renew --dry-run
certbot renew
```

### System Updates

```bash
# Keep Node.js updated
npm update -g

# Keep system packages updated
apt update && apt upgrade -y

# Check for vulnerabilities
npm audit
```

---

## Troubleshooting

### 503 Service Unavailable
- Check Node.js process: `pm2 status`
- Check logs: `pm2 logs shogi-preview`
- Verify port 3000 is open if using reverse proxy

### SSL Certificate Errors
- Verify cert files exist: `ls -la ./certs/`
- Check cert validity: `openssl x509 -in ./certs/certificate.pem -text -noout`
- Ensure domain DNS is correct: `nslookup shogisystems.com`

### High CPU/Memory Usage
- Check for memory leaks: `pm2 logs`
- Increase max_memory_restart in ecosystem.config.js
- Use clustering (already enabled in ecosystem.config.js)

### Connection Refused
- Check if Node.js is running
- Verify firewall rules: `ufw show added`
- Test locally: `curl localhost:443 -k`

---

## Performance Tips

1. **Enable Caching**
   - Configure browser caching headers in server.js
   - Use nginx cache for static files

2. **Use CDN**
   - CloudFlare, Akamai, or AWS CloudFront
   - Serves files from edge locations

3. **Monitor Performance**
   - Use New Relic, DataDog, or similar APM
   - Set up alerts for uptime

4. **Load Balancing**
   - Use PM2 cluster mode (already enabled)
   - Deploy multiple instances behind load balancer

---

## Security Best Practices

- ✅ Use HTTPS only (HTTP → HTTPS redirect)
- ✅ Keep certificates up to date
- ✅ Enable security headers (HSTS, CSP, X-Frame-Options)
- ✅ Regular security audits (`npm audit`)
- ✅ Monitor access logs for suspicious activity
- ✅ Use firewall rules (allow only needed ports)
- ✅ Keep Node.js and dependencies updated
- ✅ Run process as non-root user (avoid `sudo npm start`)

---

## Support

For issues or questions:
1. Check logs: `pm2 logs shogi-preview`
2. Review this guide
3. Contact your hosting provider
