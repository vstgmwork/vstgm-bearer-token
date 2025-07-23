const express = require("express");
const path = require("path");
const jwt = require("jsonwebtoken");
const app = express();
app.use(express.json()); // for parsing application/json

let attemptCount = 0;

const rateLimitMiddleware = (req, res, next) => {
  attemptCount++;
  if (attemptCount % 3 === 0) {
    res.status(200).send("Load Success");
  } else {
    setTimeout(() => {
      // res.status(429).send('Too Many Requests');
      res.status(600).send("Custom Failure");
    }, 5000);
  }
};

const errorMessages = [
  "Please fill out all required fields.",
  "Invalid email format. Please enter a valid email address.",
  "Password must be at least 8 characters long and include a number and a special character.",
  "The username you selected is already taken. Please choose another.",
  "Your session has expired. Please log in again.",
  "The file you uploaded is too large. Maximum file size is X MB.",
  "Unsupported file type. Please upload a [list of supported types] file.",
  "The security code you entered is incorrect. Please try again.",
  "No results found for your search query.",
  "This item is currently out of stock.",
  "The product you are looking for is no longer available.",
  "Unable to load content at this time. Please try again later.",
  "There was an error processing your request. Please try again.",
  "You do not have permission to access this page.",
  "Your account has been suspended.",
  "Incorrect username or password. Please try again.",
  "Our system is currently undergoing maintenance. Please check back soon.",
  "An unexpected error occurred. Our team has been notified.",
  "We're experiencing high traffic. Please try again in a few moments.",
  "Connectivity issue. Please check your internet connection and try again."
];

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <script defer src='https://cpqa.catchpoint.com/jp/237218/latest/InitialLoadScript.js'></script>
  <title>VSTGM Repro App</title>
</head>
<body>
</body>
</html>
`;

// Serve static files from the views folder
app.use(express.static(path.join(__dirname, "views")));

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
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/loadajax", (req, res) => {
  res.sendFile(__dirname + "/views/loadajax.html");
});

app.get("/idcard", (req, res) => {
  res.sendFile(__dirname + "/views/id_card.html");
});

app.get("/errorsim", (req, res) => {
  const message = errorMessages[Math.floor(Math.random() * errorMessages.length)];

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
  <script defer src='https://cpqa.catchpoint.com/jp/237218/latest/InitialLoadScript.js'></script>
    <meta charset="UTF-8">
    <title>Error</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #fce4e4;
        color: #b71c1c;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        text-align: center;
      }
      .message {
        border: 2px solid #f44336;
        background-color: #ffcdd2;
        padding: 30px;
        border-radius: 8px;
        max-width: 600px;
      }
    </style>
  </head>
  <body>
    <div class="message">${message}</div>
  </body>
  </html>
  `;

  // Send custom status with message as both response reason and body content
  res.status(400).type('html').send(html); // You can adjust the status code
});

app.get("/popup", (req, res) => {
  res.sendFile(__dirname + "/views/popup_sim.html");
});

app.get("/authpage", (req, res) => {
  res.sendFile(__dirname + "/views/auth_form.html");
});

app.get("/simulatedl", (req, res) => {
  res.sendFile(__dirname + "/views/simulateDL.html");
});

app.get("/mealplanner", (req, res) => {
  res.sendFile(__dirname + "/views/meal_planner.html");
});

app.get("/perfmetrics", (req, res) => {
  res.sendFile(__dirname + "/views/perfMetrics.html");
});

app.get("/jpg", (req, res) => {
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

app.get("/sitemap.xml", (req, res) => {
  res.sendFile(__dirname + "/public/sitemap.xml");
});

app.get("/:word/echo", (req, res) => {
  res.json({ echo: req.params.word });
});

app.get("/spa", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "spa.html"));
});

app.get("/proxy.pac", (req, res) => {
  res.type("application/x-ns-proxy-autoconfig");
  res.send(`
function FindProxyForURL(url, host) {
    return "PROXY 192.168.128.113:3128";
}
  `);
});

app.get("/delayed600", rateLimitMiddleware);

// Secret key for generating and verifying tokens
const SECRET_KEY = "YOUR-SECRET-KEY";

// Redirect the page N number of times
app.get('/redirect/:count', (req, res) => {
  let count = parseInt(req.params.count, 10);

  if (isNaN(count) || count < 0) {
    return res.send('Invalid redirection count. Please provide a non-negative number.');
  }

  if (count === 0) {
    return res.send(`<html><head><script defer src='https://cpqa.catchpoint.com/jp/237218/latest/InitialLoadScript.js'></script></head><body><h1>Redirection completed ${req.query.originalCount} times</h1></body></html>`);
  }

  const originalCount = req.query.originalCount || count;
  setTimeout(() => {
    res.redirect(`/redirect/${count - 1}?originalCount=${originalCount}`);
  }, 1000); // 1-second delay before redirecting
});

// Route to generate a token
app.post("/generate", (req, res) => {
  const expiresIn = "60m"; // Token validity
  const token = jwt.sign({}, SECRET_KEY, { expiresIn });
  const issuedAt = new Date();
  const utcTime = issuedAt.toISOString();

  res.set("Authorization", `Bearer ${token}`);
  res.set("utctime", utcTime);

  res.json({
    token,
    issuedAt: utcTime,
    expiresIn, // Displaying validity as a string (e.g., "60m")
    expiresAt: new Date(issuedAt.getTime() + 60 * 60 * 1000).toISOString(), // Optional: exact expiry time
  });
});

app.get("/generate", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <script defer src='https://cpqa.catchpoint.com/jp/237218/latest/InitialLoadScript.js'></script>
      <title>Token Generator</title>
    </head>
    <body>
      <h1>Generate Token</h1>
      <button onclick="generateToken()">Generate</button>
      <pre id="result"></pre>

      <script>
        async function generateToken() {
          const res = await fetch("/generate", { method: "POST" });
          const data = await res.json();
          document.getElementById("result").textContent = JSON.stringify(data, null, 2);
        }
      </script>
    </body>
    </html>
  `);
});


// Middleware for authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (null == token || undefined == token) return res.sendStatus(401); // If there isn't any token or showing as undefined

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403); // If token is not valid
    req.user = user;
    next();
  });
};

// Route to verify a token
app.post("/authenticate", authenticateToken, (req, res) => {
  const utcTime = new Date().toISOString();
  res.set("utctime", `${utcTime}`);
  res.json({ message: "Authenticated" });
});

app.get("/authenticate", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <script defer src='https://cpqa.catchpoint.com/jp/237218/latest/InitialLoadScript.js'></script>
      <title>Token Authenticator</title>
    </head>
    <body>
      <h1>Authenticate Token</h1>
      <input type="text" id="token" placeholder="Enter JWT token here" style="width: 400px;" />
      <button onclick="authenticate()">Authenticate</button>
      <pre id="result"></pre>

      <script>
        async function authenticate() {
          const token = document.getElementById("token").value.trim();
          const res = await fetch("/authenticate", {
            method: "POST",
            headers: {
              "Authorization": "Bearer " + token
            }
          });

          const resultText = res.status === 200
            ? await res.json()
            : { error: res.status + " " + res.statusText };

          document.getElementById("result").textContent = JSON.stringify(resultText, null, 2);
        }
      </script>
    </body>
    </html>
  `);
});

const delayLoadHtmlPath = __dirname + "/views/delayload.html";
const faviconPath = __dirname + "/views/favicon.ico";

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

app.get("/delayrespcode/:code/:time", (req, res) => {
  const code = parseInt(req.params.code);
  const time = parseInt(req.params.time);
  if (!isNaN(code) && !isNaN(time)) {
    setTimeout(() => {
      res.status(code).send(htmlContent);
    }, time * 1000); // Convert seconds to milliseconds
  } else {
    res.send("Invalid or Missing code/time parameter");
  }
});

app.get("/response/:code", (req, res) => {
  const code = parseInt(req.params.code);
  if (!isNaN(code)) {
    res.status(code).send(htmlContent);
  } else {
    res.send("Invalid code parameter");
  }
});

app.get("/favicon.ico", (req, res) => {
  res.sendFile(faviconPath);
});

app.get("/bigdata", (req, res) => {
  const FILE_SIZE = 350_000_000; // 350 MB
  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Content-Length", FILE_SIZE);

  const CHUNK_SIZE = 64 * 1024;
  let bytesSent = 0;

  function sendChunk() {
    if (bytesSent >= FILE_SIZE) {
      res.end();
      return;
    }

    const remaining = FILE_SIZE - bytesSent;
    const size = Math.min(CHUNK_SIZE, remaining);
    const chunk = Buffer.alloc(size, 65); // Fill with ASCII 'A'

    const ok = res.write(chunk);
    bytesSent += size;

    if (!ok) {
      res.once("drain", sendChunk);
    } else {
      setImmediate(sendChunk);
    }
  }

  sendChunk();
});

// Catch-all route (move this to the end)
app.all("*", (req, res) => {
  res.send("Invalid route");
});

app.listen(3010, () => console.log("App is listening on port 3010"));
