# 🚀 SHOGI Systems Preview - Quick Reference Card

## ⚡ Get Started in 3 Steps

```powershell
# Step 1: Generate SSL certificates (for testing)
.\generate-certs.bat

# Step 2: Start the server
npm start

# Step 3: Open in browser
# https://localhost/enterprise-dashboard-preview
# https://localhost/policy-configuration-preview
```

---

## 📍 Your Preview Sites

| Site | Development URL | Production URL |
|------|-----------------|---|
| **Enterprise Dashboard** | https://localhost/enterprise-dashboard-preview | https://shogisystems.com/enterprise-dashboard-preview |
| **Policy Configuration** | https://localhost/policy-configuration-preview | https://shogisystems.com/policy-configuration-preview |

---

## 🛠️ Essential Commands

```bash
# Development
npm start                      # Start server (port 443 or 80)
npm install                    # Install dependencies
./generate-certs.bat          # Generate test certificates

# Production (PM2)
npm install -g pm2            # Install PM2 globally
pm2 start ecosystem.config.js --env production   # Start with PM2
pm2 logs                       # View logs
pm2 stop all                   # Stop all processes

# Docker
docker-compose up -d          # Start with Docker
docker-compose down           # Stop Docker containers
docker-compose logs -f        # View Docker logs

# Testing
./test.bat                     # Run test script
```

---

## 📁 Key Files Locations

```
Project Root (c:\Users\Mifta\Downloads\shogi\)
├── server.js ........................... Express server
├── package.json ........................ Dependencies
├── public/
│   ├── enterprise-dashboard.html ...... Your HTML file
│   └── policy-configuration.html ...... Your HTML file
└── certs/
    ├── private-key.pem ............... Place your key here
    └── certificate.pem ............... Place your cert here
```

---

## 🔐 SSL Certificate Setup

### Quick (Testing)
```powershell
.\generate-certs.bat
# Creates certificates in ./certs/ (valid 365 days)
```

### Production (Free)
```bash
# Get certificate from Let's Encrypt
certbot certonly --standalone -d shogisystems.com

# Copy to project
cp /etc/letsencrypt/live/shogisystems.com/privkey.pem ./certs/private-key.pem
cp /etc/letsencrypt/live/shogisystems.com/fullchain.pem ./certs/certificate.pem
```

---

## 🌐 Domain Setup

1. **Point DNS to your server:**
   ```
   A Record: @ (root) → your.server.ip.address
   ```

2. **Verify DNS:**
   ```bash
   nslookup shogisystems.com
   # Should return your server IP
   ```

3. **Access your sites:**
   ```
   https://shogisystems.com/enterprise-dashboard-preview
   https://shogisystems.com/policy-configuration-preview
   ```

---

## 📚 Documentation Quick Links

| Document | Purpose | Time |
|----------|---------|------|
| **QUICKSTART.md** | Fast setup instructions | 5 min |
| **README.md** | Complete documentation | 20 min |
| **DEPLOYMENT.md** | Production deployment | 25 min |
| **PROJECT_OVERVIEW.md** | Project overview & paths | 10 min |
| **INDEX.md** | Documentation index | 3 min |

---

## 🚀 Deployment Paths

### Path 1: Test Locally (Now)
```powershell
.\generate-certs.bat
npm start
```
→ Visit: https://localhost/enterprise-dashboard-preview

### Path 2: Production on VPS (30 min)
```bash
# SSH into server
certbot certonly --standalone -d shogisystems.com
cp /etc/letsencrypt/live/shogisystems.com/privkey.pem ./certs/private-key.pem
cp /etc/letsencrypt/live/shogisystems.com/fullchain.pem ./certs/certificate.pem
npm install
pm2 start ecosystem.config.js --env production
```
→ Visit: https://shogisystems.com/enterprise-dashboard-preview

### Path 3: Docker (15 min)
```bash
.\generate-certs.bat
docker-compose up -d
```
→ Visit: https://localhost/enterprise-dashboard-preview

---

## 🔧 Customization

### Add a New Route
Edit `server.js`:
```javascript
app.get('/my-new-preview', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'my-file.html'));
});
```

### Change Port
Edit `server.js`:
```javascript
const PORT = process.env.PORT || 3000;  // Change 3000
```

### Add Logging
Edit `server.js`:
```javascript
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});
```

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| **Port 443 blocked** | Run `npm start` on port 3000 or use Nginx |
| **Certificate not found** | Run `./generate-certs.bat` first |
| **Sites not loading** | Check: `npm start` logs, DNS, firewall |
| **Permission denied (Unix)** | Run with `sudo npm start` or use Nginx |
| **High memory usage** | Check `pm2 logs`, restart with `pm2 restart all` |

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────┐
│  Browser / Client                   │
└──────────────────┬──────────────────┘
                   │
                   ↓ HTTPS (Port 443)
        shogisystems.com
                   │
        ┌──────────┴──────────┐
        │                     │
Direct Node.js           Nginx (Reverse Proxy)
        │                     │
        ↓                     ↓
  localhost:443         localhost:3000
        │                     │
        └──────────┬──────────┘
                   ↓
        ┌──────────────────────┐
        │  Express.js Server   │
        │  (server.js)         │
        └──────────┬───────────┘
                   │
        ┌──────────┴────────────────┐
        │                           │
        ↓                           ↓
  /enterprise-dashboard-preview  /policy-configuration-preview
        │                           │
        ↓                           ↓
  public/                         public/
  enterprise-dashboard.html       policy-configuration.html
```

---

## ✅ Pre-Launch Checklist

- [ ] Certificates generated/obtained
- [ ] `npm install` completed
- [ ] Server starts without errors (`npm start`)
- [ ] Can access locally (https://localhost/...)
- [ ] Domain DNS configured
- [ ] Server provisioned (if not local)
- [ ] Documentation reviewed
- [ ] Ready to deploy

---

## 📞 Quick Contact Info

**Project Location**: `c:\Users\Mifta\Downloads\shogi\`

**Files to Edit**:
- `server.js` - Server logic
- `package.json` - Dependencies
- `public/*.html` - Your HTML files

**Start with**: `QUICKSTART.md` (5 min read)

---

## 💡 Pro Tips

1. **Use PM2** for production (auto restart, monitoring)
   ```bash
   pm2 start ecosystem.config.js --env production
   ```

2. **Use Nginx** for better performance (reverse proxy, compression)
   ```bash
   # Use nginx.conf.example as template
   ```

3. **Monitor with PM2**
   ```bash
   pm2 status
   pm2 logs
   ```

4. **Keep certs auto-renewing**
   ```bash
   certbot renew --automated
   ```

5. **Check security**
   ```bash
   npm audit
   npm audit fix
   ```

---

## 🎯 Next Actions

**Choose one:**

### ⚡ Quick Test (5 minutes)
1. Run: `.\generate-certs.bat`
2. Run: `npm start`
3. Visit: https://localhost/enterprise-dashboard-preview

### 🚀 Deploy Now (30 minutes)
1. Read: `DEPLOYMENT.md`
2. Get SSL certificate
3. Copy to `./certs/`
4. Run: `pm2 start ecosystem.config.js --env production`
5. Update domain DNS

### 📖 Learn Everything (1 hour)
1. Read: `QUICKSTART.md` (5 min)
2. Read: `README.md` (20 min)
3. Read: `DEPLOYMENT.md` (25 min)
4. Choose deployment path

---

**Status**: ✅ Ready to Deploy

**Next Step**: Run `.\generate-certs.bat` then `npm start`

🚀 **Happy Hosting!**
