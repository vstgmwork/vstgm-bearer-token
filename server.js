const express = require("express");
const path = require("path");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json()); // for parsing application/json

// -----------------------------------------------------------------------------
// Static files
// -----------------------------------------------------------------------------
// After moving everything from ./views -> ./public, serve *everything* from here.
const PUBLIC_DIR = path.join(__dirname, "public");

// Optional backwards compatibility: if anything still requests /views/<file>,
// serve that file from /public.
app.use("/views", express.static(PUBLIC_DIR));

// Serve static assets (including index.html, moved HTML pages, images, etc.)
app.use(express.static(PUBLIC_DIR));

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

const generateHtmlForCode = (code) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script defer src='https://cpqa.catchpoint.com/jp/237218/latest/InitialLoadScript.js'></script>
      <title>VSTGM Repro App - Status ${code}</title>
      <style>
        body { font-family: sans-serif; text-align: center; padding: 40px; }
        h1 { color: #333; }
      </style>
    </head>
    <body>
      <h1>Response Triggered with Status Code: ${code}</h1>
    </body>
    </html>
  `;
};

// Middleware to log request and response details
app.use((req, res, next) => {
    // The 'finish' event is emitted when the response has been sent.
    res.on('finish', () => {
        const d = new Date();
        console.log(
            `${d.toLocaleString()} : ${req.method} - ${res.statusCode} - ${req.path} from ${req.ip}`
        );
    });

    next();
});

// -----------------------------------------------------------------------------
// Routes serving HTML pages (now from ./public)
// -----------------------------------------------------------------------------

// Route for the XHR flood test page
app.get("/xhrflood", (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "xhr_flood.html"));
});

// Route for the XHR burst test page
app.get("/xhrburst", (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "xhr_burst.html"));
});

// --- NEW ENDPOINT ADDED HERE ---
// This endpoint sends a 204 No Content response.
app.get("/api/no-content", (req, res) => {
    res.status(204).send();
});

// Endpoint for the XHR requests to hit
app.get("/xhr-endpoint", (req, res) => {
    const responseData = {
        timestamp: new Date().toISOString(),
        message: "XHR request successful",
        randomNumber: Math.random()
    };
    // Add a small random delay to simulate network latency
    const delay = Math.random() * 200; // 0 to 200ms
    setTimeout(() => {
        res.status(200).json(responseData);
    }, delay);
});

app.get("/loadajax", (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "loadajax.html"));
});

app.get("/idcard", (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "id_card.html"));
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
    res.sendFile(path.join(PUBLIC_DIR, "popup_sim.html"));
});

app.get("/authpage", (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "auth_form.html"));
});

app.get("/simulatedl", (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "simulateDL.html"));
});

app.get("/mealplanner", (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "meal_planner.html"));
});

app.get("/perfmetrics", (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "perfMetrics.html"));
});

app.get("/consent", (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "consent_page.html"));
});

app.get("/jpg", (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "naru.jpg"));
});

app.get("/txt", (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "welcome.txt"));
});

app.get("/mhtml", (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "WelcometoPimcore.mhtml"));
});

app.get("/gif", (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "thankyou.gif"));
});

app.get("/sitemap.xml", (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "sitemap.xml"));
});

app.get("/echo/:word", (req, res) => {
    res.json({ echoing: req.params.word });
});

app.get("/spa", (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "spa.html"));
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

// Route to generate a token valid for 1 week (7 days)
app.post("/generate/week", (req, res) => {
    const expiresIn = "7d";
    const token = jwt.sign({}, SECRET_KEY, { expiresIn });
    const issuedAt = new Date();
    const utcTime = issuedAt.toISOString();

    res.set("Authorization", `Bearer ${token}`);
    res.set("utctime", utcTime);

    const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

    res.json({
        token,
        issuedAt: utcTime,
        expiresIn,
        expiresAt: new Date(issuedAt.getTime() + WEEK_MS).toISOString(),
    });
});

// Route to generate a token valid for ~1 month (30 days)
app.post("/generate/month", (req, res) => {
    const expiresIn = "30d";
    const token = jwt.sign({}, SECRET_KEY, { expiresIn });
    const issuedAt = new Date();
    const utcTime = issuedAt.toISOString();

    res.set("Authorization", `Bearer ${token}`);
    res.set("utctime", utcTime);

    const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

    res.json({
        token,
        issuedAt: utcTime,
        expiresIn,
        expiresAt: new Date(issuedAt.getTime() + MONTH_MS).toISOString(),
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
      <button onclick="generateToken()">Generate (60 minutes)</button>
      <button onclick="generateTokenWeek()">Generate (1 week)</button>
      <button onclick="generateTokenMonth()">Generate (1 month)</button>
      <pre id="result"></pre>

      <script>
        async function generateToken() {
          const res = await fetch("/generate", { method: "POST" });
          const data = await res.json();
          document.getElementById("result").textContent = JSON.stringify(data, null, 2);
        }

        async function generateTokenWeek() {
          const res = await fetch("/generate/week", { method: "POST" });
          const data = await res.json();
          document.getElementById("result").textContent = JSON.stringify(data, null, 2);
        }

        async function generateTokenMonth() {
          const res = await fetch("/generate/month", { method: "POST" });
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

const delayLoadHtmlPath = path.join(PUBLIC_DIR, "delayload.html");

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

// Route that responds with a given status code after a specified delay.
app.get("/delayrespcode/:code/:time", (req, res) => {
    const code = parseInt(req.params.code);
    const time = parseInt(req.params.time);

    if (!isNaN(code) && !isNaN(time)) {
        // Call the reusable function to get the HTML
        const htmlContent = generateHtmlForCode(code);

        setTimeout(() => {
            res.status(code).send(htmlContent);
        }, time * 1000); // Convert seconds to milliseconds
    } else {
        res.status(400).send("Invalid or Missing code/time parameter.");
    }
});

// Route that responds immediately with a given status code.
app.get("/response/:code", (req, res) => {
    const code = parseInt(req.params.code);

    if (!isNaN(code)) {
        // Call the reusable function to get the HTML
        const htmlContent = generateHtmlForCode(code);
        res.status(code).send(htmlContent);
    } else {
        res.status(400).send("Invalid code parameter. Please provide a number.");
    }
});

app.get('/assetloader', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'asset_loader.html')));
app.get('/spaasset', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'spa_asset_loader.html')));
app.get('/csp-child', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'csp-child-block.html')));
// app.get('/heavy', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'marketplace_heavy.html')));

app.get('/cdn-dns-failure', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'cdn-dns-failure.html')));

app.get("/tbt/:target", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "tbt-path-repro.html"));
});

app.get("/tbt", (req, res) => res.redirect("/tbt/10s"));
app.get('/csp-root', (req, res) => {
    res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'none'; img-src 'self'; style-src 'self';");
    res.sendFile(path.join(PUBLIC_DIR, 'csp-root-block.html'));
});

// Keep this as a dedicated route so /favicon.ico always works, even if a file is
// renamed/removed later. (If public/favicon.ico exists, Express static would also
// handle it, but this makes the intent explicit.)
app.get("/favicon.ico", (req, res) => {
    // Prefer favicon.ico if you keep one, otherwise fall back to logo.ico
    const faviconPath = path.join(PUBLIC_DIR, 'favicon.ico');
    res.sendFile(faviconPath, (err) => {
        if (err) {
            res.sendFile(path.join(PUBLIC_DIR, 'logo.ico'));
        }
    });
});

app.get("/healthz", (req, res) => res.status(200).send("OK"));

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

// -------------------------------
// SSO → Credentials simulation
// -------------------------------
function getCookie(req, name) {
    const raw = req.headers.cookie || "";
    const parts = raw.split(";").map((p) => p.trim()).filter(Boolean);
    for (const p of parts) {
        const idx = p.indexOf("=");
        const k = idx >= 0 ? p.slice(0, idx) : p;
        const v = idx >= 0 ? p.slice(idx + 1) : "";
        if (k === name) return decodeURIComponent(v);
    }
    return null;
}

function setCookie(res, name, value, opts = {}) {
    const {
        path = "/",
        httpOnly = true,
        sameSite = "Lax",
        maxAgeSeconds = 60 * 60, // default 1 hour
    } = opts;

    const parts = [`${name}=${encodeURIComponent(value)}`, `Path=${path}`, `SameSite=${sameSite}`, `Max-Age=${maxAgeSeconds}`];
    if (httpOnly) parts.push("HttpOnly");
    // If you're on HTTPS, you can uncomment Secure:
    // parts.push("Secure");
    res.setHeader("Set-Cookie", parts.join("; "));
}

function clearCookie(res, name) {
    res.setHeader("Set-Cookie", `${name}=; Path=/; Max-Age=0; SameSite=Lax`);
}

function randState() {
    return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

function parseDelayMs(req) {
    const d = Number(req.query.delay || 0);
    return Number.isFinite(d) ? Math.max(0, Math.min(d, 60_000)) : 0; // clamp 0..60s
}

function decideOutcome(req) {
    // mode=success | fail | fail403 | random
    const mode = (req.query.mode || "random").toString();
    if (mode === "success") return "success";
    if (mode === "fail") return "fail";
    if (mode === "fail403") return "fail403";
    // random:
    const pFail = Number(req.query.pFail ?? 0.5);
    const pf = Number.isFinite(pFail) ? Math.max(0, Math.min(pFail, 1)) : 0.5;
    return Math.random() < pf ? "fail" : "success";
}

// Landing / control page
app.get("/sso-sim", (req, res) => {
    res.type("html").send(`
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>SSO Simulation</title>
  <style>
    body { font-family: system-ui, Arial; margin: 24px; line-height: 1.4; }
    .card { border:1px solid #ddd; border-radius: 12px; padding: 14px; margin: 12px 0; }
    code { background:#f6f6f6; padding: 2px 6px; border-radius: 6px; }
    a { display:inline-block; margin: 6px 10px 6px 0; }
    .warn { background:#fff5f5; border-color:#f1b0b7; }
  </style>
</head>
<body>
  <h1>SSO → Credentials Simulation</h1>
  <div class="card warn">
    <strong>SIMULATION ONLY:</strong> This does not contact Salesforce and does not perform real authentication.
  </div>

  <div class="card">
    <div>Start at a “protected” page (like a Salesforce org home):</div>
    <a href="/sso-sim/protected?mode=success">Force SSO success</a>
    <a href="/sso-sim/protected?mode=fail">Force SSO fail → credentials</a>
    <a href="/sso-sim/protected?mode=fail403">Fail via 403 on SSO asset → credentials</a>
    <a href="/sso-sim/protected?mode=random&pFail=0.5">Random (50% fail)</a>
  </div>

  <div class="card">
    Add delay per step (ms) to make the waterfall more obvious:
    <div><code>/sso-sim/protected?mode=random&pFail=0.5&delay=1500</code></div>
  </div>

  <div class="card">
    <a href="/sso-sim/logout">Logout (clear session cookie)</a>
  </div>
</body>
</html>
`);
});

// Protected resource (like the Salesforce landing page)
app.get("/sso-sim/protected", (req, res) => {
    const session = getCookie(req, "sso_sim_session");
    if (session === "1") {
        return res.redirect("/sso-sim/app");
    }

    const qs = new URLSearchParams({
        returnTo: "/sso-sim/app",
        mode: (req.query.mode || "random").toString(),
        pFail: (req.query.pFail || "0.5").toString(),
        delay: (req.query.delay || "0").toString(),
    }).toString();

    return res.redirect(`/sso-sim/sso/start?${qs}`);
});

// Start SSO (server redirect)
app.get("/sso-sim/sso/start", (req, res) => {
    const delay = parseDelayMs(req);
    const state = randState();

    const qs = new URLSearchParams({
        state,
        returnTo: (req.query.returnTo || "/sso-sim/app").toString(),
        mode: (req.query.mode || "random").toString(),
        pFail: (req.query.pFail || "0.5").toString(),
        delay: (req.query.delay || "0").toString(),
    }).toString();

    setTimeout(() => res.redirect(`/sso-sim/idp?${qs}`), delay);
});

// Simulated IdP page
app.get("/sso-sim/idp", (req, res) => {
    const { state, returnTo, mode, pFail, delay } = req.query;

    res.type("html").send(`
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Simulated SSO Provider</title>
  <style>
    body { font-family: system-ui, Arial; margin: 24px; line-height: 1.4; }
    .box { border:1px solid #ddd; border-radius: 12px; padding: 14px; }
    code { background:#f6f6f6; padding: 2px 6px; border-radius: 6px; }
  </style>
</head>
<body>
  <h1>Simulated SSO Provider</h1>
  <div class="box">
    <div>Attempting SSO handshake…</div>
    <div>State: <code>${String(state || "")}</code></div>
    <div>Mode: <code>${String(mode || "")}</code></div>
    <div>Delay: <code>${String(delay || "0")}ms</code></div>
    <div style="margin-top:10px;color:#555;">
      This page loads a “bridge” script. If it returns <strong>403</strong>, we fall back to credentials.
    </div>
  </div>

  <script>
    const params = new URLSearchParams(location.search);
    const returnTo = params.get("returnTo") || "/sso-sim/app";
    const mode = params.get("mode") || "random";
    const pFail = params.get("pFail") || "0.5";
    const delay = params.get("delay") || "0";
    const state = params.get("state") || "";

    function go(url) { window.location.replace(url); }

    window.__SSO_BRIDGE_OK = false;

    const s = document.createElement("script");
    s.src = "/sso-sim/idp/bridge.js?mode=" + encodeURIComponent(mode) +
            "&pFail=" + encodeURIComponent(pFail) +
            "&delay=" + encodeURIComponent(delay);

    s.onload = () => { /* bridge sets __SSO_BRIDGE_OK */ };
    s.onerror = () => {
      go("/sso-sim/credentials?reason=idp_asset_403&returnTo=" + encodeURIComponent(returnTo) +
         "&mode=" + encodeURIComponent(mode) + "&pFail=" + encodeURIComponent(pFail) + "&delay=" + encodeURIComponent(delay));
    };

    document.head.appendChild(s);

    // After a short “handshake” time, go to callback if bridge OK; else fallback.
    setTimeout(() => {
      if (!window.__SSO_BRIDGE_OK) {
        go("/sso-sim/credentials?reason=idp_bridge_missing&returnTo=" + encodeURIComponent(returnTo) +
           "&mode=" + encodeURIComponent(mode) + "&pFail=" + encodeURIComponent(pFail) + "&delay=" + encodeURIComponent(delay));
        return;
      }
      go("/sso-sim/sso/callback?state=" + encodeURIComponent(state) +
         "&returnTo=" + encodeURIComponent(returnTo) +
         "&mode=" + encodeURIComponent(mode) + "&pFail=" + encodeURIComponent(pFail) + "&delay=" + encodeURIComponent(delay));
    }, 1200);
  </script>
</body>
</html>
`);
});

// Bridge asset that can be 403 (simulating “SSO asset blocked”)
app.get("/sso-sim/idp/bridge.js", (req, res) => {
    const delay = parseDelayMs(req);
    const mode = (req.query.mode || "random").toString();

    // If explicitly fail via 403 asset:
    if (mode === "fail403") {
        return setTimeout(() => {
            res.status(403).type("application/javascript").send("// Forbidden (simulated)\n");
        }, delay);
    }

    // Otherwise succeed (even if the overall auth later fails)
    setTimeout(() => {
        res.type("application/javascript").send("window.__SSO_BRIDGE_OK = true;");
    }, delay);
});

// Callback endpoint: decides success/fail and redirects accordingly
app.get("/sso-sim/sso/callback", (req, res) => {
    const delay = parseDelayMs(req);
    const outcome = decideOutcome(req);
    const returnTo = (req.query.returnTo || "/sso-sim/app").toString();

    setTimeout(() => {
        if (outcome === "success") {
            setCookie(res, "sso_sim_session", "1", { maxAgeSeconds: 60 * 60 }); // 1h session
            return res.redirect(returnTo);
        }

        // fall back to credentials
        const qs = new URLSearchParams({
            reason: "sso_rejected",
            returnTo,
            mode: (req.query.mode || "random").toString(),
            pFail: (req.query.pFail || "0.5").toString(),
            delay: (req.query.delay || "0").toString(),
        }).toString();

        return res.redirect(`/sso-sim/credentials?${qs}`);
    }, delay);
});

// “Credentials” page (generic, test-only)
app.get("/sso-sim/credentials", (req, res) => {
    const reason = (req.query.reason || "unknown").toString();
    const returnTo = (req.query.returnTo || "/sso-sim/app").toString();

    res.type("html").send(`
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Credentials Required (Simulation)</title>
  <style>
    body { font-family: system-ui, Arial; margin: 24px; line-height: 1.4; }
    .card { border:1px solid #ddd; border-radius: 12px; padding: 14px; max-width: 640px; }
    .warn { background:#fff5f5; border-color:#f1b0b7; }
    code { background:#f6f6f6; padding: 2px 6px; border-radius: 6px; }
    button { padding: 10px 12px; border-radius: 10px; border: 1px solid #ccc; background:#fff; cursor:pointer; }
  </style>
</head>
<body>
  <h1>Credentials Required (Simulation)</h1>
  <div class="card warn">
    <strong>TEST ONLY:</strong> This page is not a real login. Do not enter real credentials.
  </div>

  <div class="card" style="margin-top:12px;">
    <div>SSO failed, falling back to credentials.</div>
    <div>Reason: <code>${reason}</code></div>
    <div>ReturnTo: <code>${returnTo}</code></div>
    <p style="color:#555;">
      Click “Continue” to simulate a successful credential login and go back to the protected app.
    </p>

    <a href="/sso-sim/credentials/continue?returnTo=${encodeURIComponent(returnTo)}">
      <button>Continue</button>
    </a>
  </div>

  <p style="margin-top:14px;"><a href="/sso-sim/logout">Logout</a> • <a href="/sso-sim">Back to SSO controls</a></p>
</body>
</html>
`);
});

// Simulate successful credential login
app.get("/sso-sim/credentials/continue", (req, res) => {
    const returnTo = (req.query.returnTo || "/sso-sim/app").toString();
    setCookie(res, "sso_sim_session", "1", { maxAgeSeconds: 60 * 60 });
    res.redirect(returnTo);
});

// App page (requires session)
app.get("/sso-sim/app", (req, res) => {
    const session = getCookie(req, "sso_sim_session");
    if (session !== "1") {
        return res.redirect("/sso-sim/protected");
    }

    res.type("html").send(`
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Protected App (Simulation)</title>
  <style>
    body { font-family: system-ui, Arial; margin: 24px; line-height: 1.4; }
    .card { border:1px solid #ddd; border-radius: 12px; padding: 14px; max-width: 760px; }
    code { background:#f6f6f6; padding: 2px 6px; border-radius: 6px; }
  </style>
</head>
<body>
  <h1>Protected App (Simulation)</h1>
  <div class="card">
    <div>You are “logged in” via the simulated session cookie.</div>
    <div>Cookie: <code>sso_sim_session=1</code></div>
    <p>Use DevTools → Network to inspect the redirect chain that got you here.</p>
    <p><a href="/sso-sim/logout">Logout</a></p>
  </div>
</body>
</html>
`);
});

app.get("/sso-sim/logout", (req, res) => {
    clearCookie(res, "sso_sim_session");
    res.redirect("/sso-sim");
});

// Route that responds with a random 4xx or 5xx error code.
app.all("/randresp", (req, res) => {
    let randomCode;
    const isClientError = Math.random() > 0.5; // 50% chance for 4xx vs 5xx

    if (isClientError) {
        // Generate a random code from 400 to 499
        randomCode = Math.floor(Math.random() * 100) + 400;
    } else {
        // Generate a random code from 500 to 511 (common server errors)
        randomCode = Math.floor(Math.random() * 12) + 500;
    }

    const htmlContent = generateHtmlForCode(randomCode);
    res.status(randomCode).send(htmlContent);
});

// ----------------------------------------
// Dynamic download endpoint: /download/10k | /download/10m | /download/10g
// ----------------------------------------

// Uses decimal units (k=1000, m=1,000,000, g=1,000,000,000)
// This matches your existing /bigdata style where 350MB = 350_000_000 bytes :contentReference[oaicite:2]{index=2}
function parseDownloadSizeSpec(spec) {
    // Accept: 10k, 10m, 10g (case-insensitive), optionally with 'b' (10mb)
    const m = String(spec || "").trim().match(/^(\d+)([kmg])b?$/i);
    if (!m) {
        return {
            ok: false,
            error: "Invalid size. Use /download/10k, /download/10m, or /download/10g"
        };
    }

    const qty = parseInt(m[1], 10);
    const unit = m[2].toLowerCase();

    if (!Number.isFinite(qty) || qty <= 0) {
        return { ok: false, error: "Size must be a positive integer." };
    }

    const multipliers = {
        k: 1_000,
        m: 1_000_000,
        g: 1_000_000_000
    };

    const bytes = qty * multipliers[unit];

    // Safety cap (adjust if you want). This allows up to 10g (10 GB) comfortably.
    const MAX_BYTES = 10 * 1_000_000_000; // 10 GB (decimal)
    if (bytes > MAX_BYTES) {
        return { ok: false, error: `Requested size too large. Max is 10g (${MAX_BYTES} bytes).` };
    }

    return { ok: true, qty, unit, bytes, label: `${qty}${unit}` };
}

// Optional: HEAD support (lets you verify headers/Content-Length without downloading)
app.head("/download/:size", (req, res) => {
    const parsed = parseDownloadSizeSpec(req.params.size);
    if (!parsed.ok) return res.status(400).send(parsed.error);

    const { bytes, label } = parsed;
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="download_${label}.bin"`);
    res.setHeader("Content-Length", String(bytes));
    res.setHeader("Cache-Control", "no-store");
    res.end();
});

app.get("/download/:size", (req, res) => {
    const parsed = parseDownloadSizeSpec(req.params.size);
    if (!parsed.ok) return res.status(400).send(parsed.error);

    const { bytes, label } = parsed;

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="download_${label}.bin"`);
    res.setHeader("Content-Length", String(bytes));
    res.setHeader("Cache-Control", "no-store");

    // Stream content in chunks (don’t allocate the whole file in memory)
    const CHUNK_SIZE = 256 * 1024; // 256 KB
    const chunk = Buffer.alloc(CHUNK_SIZE, 65); // 'A'

    let bytesSent = 0;
    let stopped = false;

    // Stop streaming if client disconnects
    req.on("close", () => { stopped = true; });

    function sendChunk() {
        if (stopped || res.writableEnded || res.destroyed) return;

        if (bytesSent >= bytes) {
            res.end();
            return;
        }

        const remaining = bytes - bytesSent;
        const size = Math.min(CHUNK_SIZE, remaining);

        // subarray avoids new allocations; content is constant so safe
        const ok = res.write(chunk.subarray(0, size));
        bytesSent += size;

        if (!ok) {
            res.once("drain", sendChunk);
        } else {
            setImmediate(sendChunk);
        }
    }

    sendChunk();
});

// ----------------------------------------
// /download/<size> via GET and PUT
// Examples: /download/10k  /download/10m  /download/10g
// ----------------------------------------

function parseDownloadSizeSpec(spec) {
    const m = String(spec || "").trim().match(/^(\d+)([kmg])b?$/i);
    if (!m) return { ok: false, error: "Invalid size. Use /download/10k, /download/10m, or /download/10g" };

    const qty = parseInt(m[1], 10);
    const unit = m[2].toLowerCase();
    if (!Number.isFinite(qty) || qty <= 0) return { ok: false, error: "Size must be a positive integer." };

    const multipliers = { k: 1_000, m: 1_000_000, g: 1_000_000_000 };
    const bytes = qty * multipliers[unit];

    // Adjust/remove this safety cap if needed
    const MAX_BYTES = 10 * 1_000_000_000; // 10 GB
    if (bytes > MAX_BYTES) return { ok: false, error: "Requested size too large (max 10g)." };

    return { ok: true, bytes, label: `${qty}${unit}` };
}

function streamDownload(req, res) {
    const parsed = parseDownloadSizeSpec(req.params.size);
    if (!parsed.ok) return res.status(400).send(parsed.error);

    const { bytes, label } = parsed;

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="download_${label}.bin"`);
    res.setHeader("Content-Length", String(bytes));
    res.setHeader("Cache-Control", "no-store");

    const CHUNK_SIZE = 256 * 1024; // 256KB
    const chunk = Buffer.alloc(CHUNK_SIZE, 65); // 'A'
    let sent = 0;
    let stopped = false;

    req.on("close", () => { stopped = true; });

    function pump() {
        if (stopped || res.writableEnded || res.destroyed) return;
        if (sent >= bytes) return res.end();

        const remaining = bytes - sent;
        const size = Math.min(CHUNK_SIZE, remaining);

        const ok = res.write(chunk.subarray(0, size));
        sent += size;

        if (!ok) res.once("drain", pump);
        else setImmediate(pump);
    }

    pump();
}

// GET download
app.get("/download/:size", streamDownload);

// PUT download (non-standard, but useful for testing)
app.put("/download/:size", streamDownload);

// Optional: HEAD support (inspect headers without downloading)
// app.head("/download/:size", streamDownload);

// -----------------------------------------------------------------------------
// /heavy (page) + /heavy/file/:id (streams a >50MB binary file)
// Default: 55MB (decimal) per file
// -----------------------------------------------------------------------------

const HEAVY_DEFAULT_BYTES = 55_000_000; // 55 MB (decimal) => > 50 MB
const HEAVY_MIN_BYTES = 50_000_001;     // must be > 50MB
const HEAVY_MAX_BYTES = Number(process.env.HEAVY_MAX_SIZE_BYTES || "200000000"); // 200MB cap by default

const HEAVY_CHUNK_SIZE = 64 * 1024; // 64KB
const HEAVY_CHUNK = Buffer.alloc(HEAVY_CHUNK_SIZE, 65); // 'A'

function parseHumanSizeToBytes(spec) {
    if (!spec) return HEAVY_DEFAULT_BYTES;
    const s = String(spec).trim();

    // Accept 55m / 60mb / 10k / 1g (decimal units)
    const m = s.match(/^(\d+)([kmg])b?$/i);
    if (m) {
        const n = parseInt(m[1], 10);
        const u = m[2].toLowerCase();
        const mult = u === "k" ? 1_000 : u === "m" ? 1_000_000 : 1_000_000_000;
        return n * mult;
    }

    // Also accept plain bytes: ?size=60000000
    const asNum = Number(s);
    if (Number.isFinite(asNum)) return Math.floor(asNum);

    return null;
}

function streamFixedBytes(req, res, totalBytes) {
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Length", String(totalBytes));
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");

    let sent = 0;
    let stopped = false;

    req.on("close", () => { stopped = true; });

    function pump() {
        if (stopped || res.writableEnded || res.destroyed) return;
        if (sent >= totalBytes) return res.end();

        const remaining = totalBytes - sent;
        const size = Math.min(HEAVY_CHUNK_SIZE, remaining);

        const ok = res.write(HEAVY_CHUNK.subarray(0, size));
        sent += size;

        if (!ok) res.once("drain", pump);
        else setImmediate(pump);
    }

    pump();
}

// Page: /heavy
app.get("/heavy", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "heavy.html"));
});

// Large file stream: /heavy/file/1?size=55m
app.get("/heavy/file/:id", (req, res) => {
    const id = String(req.params.id || "0").replace(/[^0-9A-Za-z_-]/g, "");
    const sizeSpec = req.query.size || req.query.s || "";
    const bytes = parseHumanSizeToBytes(sizeSpec);

    const finalBytes = (bytes == null) ? HEAVY_DEFAULT_BYTES : bytes;

    if (!Number.isFinite(finalBytes) || finalBytes <= 0) {
        return res.status(400).send("Invalid size. Example: /heavy/file/1?size=55m");
    }
    if (finalBytes < HEAVY_MIN_BYTES) {
        return res.status(400).send("Size must be > 50MB. Example: ?size=55m");
    }
    if (finalBytes > HEAVY_MAX_BYTES) {
        return res.status(413).send(`Too large. Max allowed is ${HEAVY_MAX_BYTES} bytes. (Set HEAVY_MAX_SIZE_BYTES to change.)`);
    }

    res.setHeader("Content-Disposition", `attachment; filename="heavy_${id}_${finalBytes}.bin"`);
    streamFixedBytes(req, res, finalBytes);
});

// Catch-all route (move this to the end)
app.all("*", (req, res) => {
    res.status(400).send("Invalid route");
});


const PORT = 3010;
const HOST = "0.0.0.0";
app.listen(PORT, HOST, () => console.log(`App is listening on http://${HOST}:${PORT}`));
