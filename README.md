# SHOGI Systems - Seed Round Investor Page

Hosting for the SHOGI Seed Round Investor preview site.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Server
```bash
npm start
```

### 3. Visit Site
```
http://localhost:3000/seed-round-investor-page
```

---

## Project Structure

```
shogi/
├── server.js                              # Express server
├── package.json                           # Dependencies
├── public/
│   └── seed-round-investor-page.html      # Investor page preview
├── vercel.json                            # Vercel deployment config
└── README.md                              # This file
```

---

## Deployment to Vercel

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to https://vercel.com
   - Import your GitHub repository
   - Click "Deploy"
   - Done! Your site is live

3. **Access Your Site**
   ```
   https://your-project.vercel.app/seed-round-investor-page
   ```

---

## Files

- **server.js** - Express server that serves the HTML files
- **public/** - Static HTML files (served as-is)
- **package.json** - Node.js dependencies
- **vercel.json** - Vercel deployment configuration

---

## Features

✅ Two preview sites  
✅ Simple Express server  
✅ Ready for Vercel deployment  
✅ No modifications to HTML files  

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3000 in use | Change in server.js or use different port |
| Module not found | Run `npm install` |
| Sites not loading | Check server is running: `npm start` |

---

## License

MIT

"# shogi-funding" 
