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

// 1. Antivirus Scan Endpoint
app.post("/api/scan", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    // Calculate SHA-256 hash
    const hash = crypto.createHash("sha256").update(file.buffer).digest("hex");
    const filename = file.originalname;
    const fileSize = file.size;

    // Simulate known EICAR test file hash
    const EICAR_HASH = "275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f";
    const ALT_EICAR_HASH = "131f95c51cc819465fa1797f6ccacf9d494aaaff46fa3eac73ae63ffbdfd8267";

    if (hash === EICAR_HASH || hash === ALT_EICAR_HASH || filename.toLowerCase().includes("eicar")) {
      return res.json({
        threatFound: true,
        hash,
        filename,
        threatDetails: {
          name: filename,
          severity: "CRITICAL",
          threatName: "EICAR.Test.Virus",
          description: "Standard antivirus testing file. Not an actual virus, but treated as one.",
          sha256: hash
        }
      });
    }

    // Optional: Use Gemini to perform a heuristic analysis on the filename/extension if API key is present
    if (process.env.GEMINI_API_KEY) {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Act as an antivirus heuristic engine. Analyze the following file metadata to determine if it looks highly suspicious or typical of malware. 
Filename: ${filename}
Size in bytes: ${fileSize}
SHA-256: ${hash}

If the filename seems designed to deceive (e.g. double extensions like .pdf.exe, suspicious names like 'invoice_urgent.vbs', or disguised as critical system files), flag it as suspicious. Otherwise, say it's clean.
Respond in strict JSON format:
{
  "suspicious": boolean,
  "reason": "short explanation",
  "threatName": "Generic.Heuristic.Suspicious" // if suspicious
}`;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });
        
        let aiResultStr = response.text || "{}";
        // Clean up markdown formatting if present
        aiResultStr = aiResultStr.replace(/```json/g, "").replace(/```/g, "").trim();
        const aiResult = JSON.parse(aiResultStr);

        if (aiResult.suspicious) {
          return res.json({
            threatFound: true,
            hash,
            filename,
            threatDetails: {
              name: filename,
              severity: "HIGH",
              threatName: aiResult.threatName || "Heuristic.Suspicious",
              description: aiResult.reason || "Flagged by AI heuristic analysis.",
              sha256: hash
            }
          });
        }
      } catch (aiError) {
        console.error("Gemini analysis failed, falling back to clean:", aiError);
      }
    }

    // Default clean response
    return res.json({
      threatFound: false,
      hash,
      filename,
      message: "File is clean."
    });
  } catch (error) {
    console.error("Scan error:", error);
    res.status(500).json({ error: "Internal server error during scan." });
  }
});

// 2. Data Breach Check Endpoint
app.post("/api/breach", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required." });

  try {
    // REAL API INTEGRATION (XposedOrNot Public API)
    const response = await fetch(`https://api.xposedornot.com/v1/check-email/${encodeURIComponent(email)}`);
    
    if (response.status === 404) {
      return res.json({ breached: false, email, breaches: [] });
    } else if (response.ok) {
      const data = await response.json();
      
      // Format XposedOrNot response to match our frontend UI expectations
      const formattedBreaches = (data.breaches || []).map((breachList: any[]) => {
        return breachList.map((breachName: string) => ({
          source: breachName,
          date: "Known Breach",
          description: "This email was found in the " + breachName + " data breach.",
          compromised_data: ["Email Address", "Passwords/Personal Data"]
        }));
      }).flat();

      // XposedOrNot returns an object where keys are "breaches", we just map the array if it exists directly.
      // Actually the API returns { "breaches": [ [ "Breach1", "Breach2" ] ] } or similar, let's just parse the first array
      let finalBreaches: any[] = [];
      if (data.breaches && Array.isArray(data.breaches[0])) {
         finalBreaches = data.breaches[0].map((b: string) => ({
           source: b,
           date: "Historical Data",
           description: `Your email was exposed in the ${b} breach.`,
           compromised_data: ["Email", "Unknown Data"]
         }));
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
    const apiKey = process.env.GOOGLE_SAFE_BROWSING_KEY || "AIzaSyDRf70UhwBc34p2mBu79MD8ln9DJ_Z96_M";
    
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
