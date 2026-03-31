# vstgm-bearer-token

1. npm install
2. Add your key in server.js (if you are planning to use the /generate and /authenticate) and save it
3. npm start

## Consent Page utag.js

Only the `/consent` page loads the local `/utag.js` wrapper.

- `/utag.js` then loads `https://qaportal.catchpoint.com/jp/237218/latest/InitialLoadScript.js`
- `pageHide` mode is enabled inside `public/utag.js`
- Other pages are left as they were before
