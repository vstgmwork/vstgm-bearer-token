# vstgm-bearer-token

1. npm install
2. Set environment variables:
   - `JWT_SECRET` (required in production)
   - `GENERATE_BASIC_AUTH_USER` + `GENERATE_BASIC_AUTH_PASS` (recommended to protect `/generate*`)
   - `GENERATE_ALLOWLIST` (optional comma-separated IPs allowed for `/generate*`)
   - `PORT` (optional, defaults to `3010`)
   - `CANONICAL_HOST` (optional, defaults to `www.vstgm.co.in`)
   - `ENABLE_CANONICAL_REDIRECT` (optional, defaults to `true`)
   - `SCENARIO_RATE_LIMIT_WINDOW_MS` (optional, defaults to `60000`)
   - `SCENARIO_RATE_LIMIT_MAX_REQUESTS` (optional, defaults to `60` in production)
   - `STREAM_MAX_CONCURRENT_PER_IP` (optional, defaults to `2` in production)
3. npm start
