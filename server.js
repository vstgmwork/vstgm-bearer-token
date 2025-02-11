const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json()); // for parsing application/json

let attemptCount = 0;

const rateLimitMiddleware = (req, res, next) => {
  attemptCount++;
  if (attemptCount % 3 === 0) {
    res.status(200).send("Success");
  } else {
    setTimeout(() => {
      // res.status(429).send('Too Many Requests');
      res.status(600).send("Custom Failure");
    }, 5000);
  }
};

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

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/loadajax", (req, res) => {
  res.sendFile(__dirname + "/views/loadajax.html");
});

app.get("/narujpg", (req, res) => {
  res.sendFile(__dirname + "/views/naru.jpg");
});

app.get("/txt", (req, res) => {
  res.sendFile(__dirname + "/views/welcome.txt");
});

app.get("/mhtml", (req, res) => {
  res.sendFile(__dirname + "/views/WelcometoPimcore.mhtml");
});

app.get("/gif", (req, res) => {
  res.sendFile(__dirname + "/views/thankyou.gif");
});

app.get("/:word/echo", (req, res) => {
  res.json({ echo: req.params.word });
});

app.get("/delayed429", rateLimitMiddleware);
// app.use('/delayed429', (req, res, next) => {
//     requestCount++; // Increment request count for each incoming request

//     // Check if request count is even
//     if (requestCount % 2 === 0) {
//         // If request count is even, return 429 Too Many Requests
//         setTimeout(() => {
//             res.status(429).send('Too Many Requests');
//         }, 5000); // 5 seconds delay before sending 429
//     } else {
//         // If request count is odd, serve an HTML file
//         res.sendFile(__dirname + "/views/index.html");
//     }

//     // setTimeout(() => {
//     //     res.status(429).send('Too Many Requests');
//     // }, 5000); // 5 seconds delay
// });

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

const delayLoadHtmlPath = __dirname + "/views/delayload.html";
const faviconPath = __dirname + "/views/favicon.ico";

// Route to load the delayload.html file after a specified amount of time
app.get("/delayload/:time", (req, res) => {
  const time = parseInt(req.params.time);
  if (!isNaN(time)) {
    setTimeout(() => {
      res.sendFile(delayLoadHtmlPath);
    }, time * 1000); // Convert seconds to milliseconds
  } else {
    res.send("Invalid time parameter");
  }
});

app.get("/response/:code", (req, res) => {
  const code = parseInt(req.params.code);
  if (!isNaN(code)) {
    res.status(code).sendStatus(code);
  } else {
    res.send("Invalid time parameter");
  }
});

app.get("/favicon.ico", (req, res) => {
  res.sendFile(faviconPath);
});

// Catch-all route (move this to the end)
app.all("*", (req, res) => {
  res.send("Invalid route");
});

app.listen(3010, () => console.log('App is listening on port 3010'));
