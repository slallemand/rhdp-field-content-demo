const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>RHDP Field Content Demo</title>
      <style>
        body {
          font-family: 'Red Hat Display', Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #ee0000 0%, #8b0000 100%);
          color: white;
        }
        .container {
          text-align: center;
          padding: 40px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        h1 {
          font-size: 3em;
          margin: 0;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }
        p {
          font-size: 1.2em;
          margin-top: 20px;
          opacity: 0.9;
        }
        .logo {
          font-size: 4em;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">🎯</div>
        <h1>Hello RHDP Field Content!</h1>
        <p>Deployed via GitOps with ArgoCD</p>
        <p>Built on Red Hat UBI Node.js</p>
      </div>
    </body>
    </html>
  `);
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
