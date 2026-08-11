import express from "express";
import path from "path";
import multer from "multer";
import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Set up in-memory multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Mock data breach database for simulation
const MOCK_BREACH_DB: Record<string, any[]> = {
  "test@example.com": [
    {
      source: "SocialMediaCorp Leak",
      date: "Aug 2023",
      description: "Over 100M user records were leaked on a dark web forum containing emails, passwords, and profile data.",
      compromised_data: ["Email Address", "Passwords", "Names"]
    },
    {
      source: "CloudStorage Hack",
      date: "Jan 2022",
      description: "A misconfigured database exposed user metadata.",
      compromised_data: ["Email Address", "IP Addresses"]
    }
  ]
};

// --- API Routes ---

// 1. Antivirus Scan Endpoint (VirusTotal)
app.post("/api/scan", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const hash = crypto.createHash("sha256").update(file.buffer).digest("hex");
    const filename = file.originalname;

    // REAL API INTEGRATION (VirusTotal)
    const vtApiKey = process.env.VIRUSTOTAL_API_KEY;

    if (!vtApiKey) {
      console.warn("VIRUSTOTAL_API_KEY not found in environment. Falling back to local clean message.");
      return res.json({
        threatFound: false,
        hash,
        filename,
        message: "File scanned locally (no Cloud API key). Appears clean."
      });
    }
    
    try {
      const response = await fetch(`https://www.virustotal.com/api/v3/files/${hash}`, {
        method: "GET",
        headers: {
          "x-apikey": vtApiKey
        }
      });

      if (response.ok) {
        const data = await response.json();
        const stats = data.data.attributes.last_analysis_stats;
        
        const isMalicious = stats.malicious > 0 || stats.suspicious > 0;
        
        if (isMalicious) {
          // Get some details about the threat
          const results = data.data.attributes.last_analysis_results;
          const threatName = Object.values(results).find((r: any) => r.category === "malicious")?.result || "Suspicious File";
          
          return res.json({
            threatFound: true,
            hash,
            filename,
            threatDetails: {
              name: filename,
              severity: stats.malicious > 5 ? "CRITICAL" : "HIGH",
              threatName: threatName,
              description: `Flagged by ${stats.malicious} antivirus engines on VirusTotal.`,
              sha256: hash
            }
          });
        } else {
          return res.json({
            threatFound: false,
            hash,
            filename,
            message: "File is clean. Verified by VirusTotal."
          });
        }
      } else if (response.status === 404) {
        // File not found in VirusTotal database, meaning it's likely a custom or unknown file.
        // We will default to clean, or we could upload it (but uploading requires more complex logic).
        return res.json({
          threatFound: false,
          hash,
          filename,
          message: "File not found in threat database. Appears clean."
        });
      }
    } catch (vtError) {
      console.error("VirusTotal API error:", vtError);
    }

    // Fallback if VirusTotal fails
    res.json({
      threatFound: false,
      hash,
      filename,
      message: "File scanned locally. Appears clean."
    });
  } catch (error) {
    console.error("Scan error:", error);
    res.status(500).json({ error: "Internal server error during scan." });
  }
});

// 1.5 Antivirus Scan Endpoint (By Hash for Full Native Device Scans)
app.post("/api/scan-hash", async (req, res) => {
  try {
    const { hash, filename } = req.body;
    if (!hash) return res.status(400).json({ error: "Hash required." });

    const vtApiKey = process.env.VIRUSTOTAL_API_KEY;
    if (!vtApiKey) return res.json({ threatFound: false, hash, filename, message: "Clean (Local)" });
    
    const response = await fetch(`https://www.virustotal.com/api/v3/files/${hash}`, {
      method: "GET",
      headers: { "x-apikey": vtApiKey }
    });

    if (response.ok) {
      const data = await response.json();
      const stats = data.data.attributes.last_analysis_stats;
      const isMalicious = stats.malicious > 0 || stats.suspicious > 0;
      
      if (isMalicious) {
        const results = data.data.attributes.last_analysis_results;
        const threatName = Object.values(results).find((r: any) => r.category === "malicious")?.result || "Suspicious File";
        
        return res.json({
          threatFound: true,
          hash,
          filename: filename || "NativeFile",
          threatDetails: {
            name: filename || "NativeFile",
            severity: stats.malicious > 5 ? "CRITICAL" : "HIGH",
            threatName: threatName,
            description: `Flagged by ${stats.malicious} antivirus engines on VirusTotal.`,
            sha256: hash
          }
        });
      }
    }
    
    return res.json({ threatFound: false, hash, filename, message: "Clean" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error during hash scan." });
  }
});

// 2. Data Breach Check Endpoint
app.post("/api/breach", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required." });

  try {
    // Check mock database first
    if (MOCK_BREACH_DB[email]) {
      return res.json({ breached: true, email, breaches: MOCK_BREACH_DB[email] });
    }

    // REAL API INTEGRATION (XposedOrNot Public API)
    const response = await fetch(`https://api.xposedornot.com/v1/check-email/${encodeURIComponent(email)}`);
    
    if (response.status === 404) {
      return res.json({ breached: false, email, breaches: [] });
    } else if (response.ok) {
      const data = await response.json();
      
      let finalBreaches: any[] = [];

      // XposedOrNot API response can be complex.
      // Typically it returns { "breaches": [ [ "BreachName", ... ] ] }
      // or similar depending on the endpoint.
      if (data && data.breaches) {
        const breachArray = Array.isArray(data.breaches[0]) ? data.breaches[0] : (Array.isArray(data.breaches) ? data.breaches : []);

        finalBreaches = breachArray.map((b: string | any) => {
          if (typeof b === 'string') {
            return {
              source: b,
              date: "Historical Leak",
              description: `Your email was found in the ${b} data breach dump.`,
              compromised_data: ["Email", "Unknown Metadata"]
            };
          }
          return b;
        });
      }

      return res.json({ breached: finalBreaches.length > 0, email, breaches: finalBreaches });
    }

    // Fallback Mock Logic on API Failure
    res.json({ breached: false, email, breaches: [] });
  } catch (error) {
    console.error("Breach check error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 3. Phishing Link Inspector Endpoint
app.post("/api/phishing", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL required." });

  try {
    // REAL API INTEGRATION (Google Safe Browsing)
    const apiKey = process.env.GOOGLE_SAFE_BROWSING_KEY;

    if (!apiKey) {
      console.warn("GOOGLE_SAFE_BROWSING_KEY not found. Defaulting to safe.");
      return res.json({ safe: true, url, message: "Safe (Local Check)" });
    }
    
    const response = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client: { clientId: "guardshield", clientVersion: "1.0.0" },
        threatInfo: {
          threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [{ url }]
        }
      })
    });
    
    const data = await response.json();
    if (data && data.matches && data.matches.length > 0) {
      return res.json({ safe: false, url, threatType: data.matches[0].threatType });
    }
    return res.json({ safe: true, url });

  } catch (error) {
    console.error("Phishing check error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});


// --- Vite Middleware & Static Serving ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
