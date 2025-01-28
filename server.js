const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json()); // for parsing application/json

app.use((req, res, next) => {
  var d = new Date();
  console.log(
    `${d.toLocaleString()} : ${req.method} accessing ${req.path} from ${req.ip}`
  );
  // Add "locale" and "rand-num" headers to the response
  const locale = req.headers["accept-language"]
    ? req.headers["accept-language"].split(",")[0].slice(0, 2).toLowerCase()
    : "en"; // Default to 'en'
  const randNum = Math.floor(Math.random() * 10001); // Random number between 0 and 10000
  res.setHeader("locale", locale);
  res.setHeader("rand-num", randNum);
  next();
});

// Secret key for generating and verifying tokens
const SECRET_KEY = 'YOUR-SECRET-KEY';

// Route to generate a token
app.post("/generate", (req, res) => {
  const token = jwt.sign({}, SECRET_KEY, { expiresIn: "4m" });
  const utcTime = new Date().toISOString();
  res.set("Authorization", `Bearer ${token}`);
  res.set("utctime", `${utcTime}`);
  res.json({ token });
});

// Middleware for authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (null == token || undefined == token) return res.sendStatus(401); // If there isn't any token or showing as undefined

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403); // If token is not valid
    req.user = user;
    next();
  });
}

// Route to verify a token
app.post("/authenticate", authenticateToken, (req, res) => {
  const utcTime = new Date().toISOString();
  res.set("utctime", `${utcTime}`);
  res.json({ message: "Authenticated" });
});

// Catch-all route (move this to the end)
app.all("*", (req, res) => {
  res.send("Invalid route");
});

app.listen(3010, () => console.log('App is listening on port 3010'));
