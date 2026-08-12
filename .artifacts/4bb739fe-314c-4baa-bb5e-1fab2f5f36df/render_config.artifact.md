# Render Backend Configuration

To ensure your backend at `https://gaurdshield-2.onrender.com` functions correctly with the native app features, you must add the following **Environment Variables** in the Render Dashboard (Environment section):

## Required Variables

| Key | Value | Description |
| :--- | :--- | :--- |
| `VIRUSTOTAL_API_KEY` | `2cb0b60bcf973d948fc510d772e12b5df4793f9b9599108870ee7311e231b780` | For SHA-256 malware scanning. |
| `SAFE_BROWSING_API_KEY` | `AIzaSyDRf70UhwBc34p2mBu79MD8ln9DJ_Z96_M` | For Phishing link detection. |
| `XPOSEDORNOT_API_KEY` | *(Optional)* | For data breach checks. |
| `NODE_ENV` | `production` | Ensures the server runs in optimized mode. |
| `PORT` | `3000` | (Or whichever port your server code expects). |
| `CORS_ORIGIN` | `*` or `capacitor://localhost` | **CRITICAL**: Allows the Android app to talk to the backend. |

## Troubleshooting "Backend Not Connected"
If the app still shows "Backend not connected":
1. **Check CORS**: Ensure your Node.js/Express server has CORS enabled and allows `capacitor://localhost` (for Android) and `http://localhost` (for web).
2. **Logs**: Check the **Logs** tab in Render to see if the server is crashing or rejecting requests.
3. **HTTPS**: Render provides HTTPS by default, so ensure your frontend `VITE_API_URL` starts with `https://`.
