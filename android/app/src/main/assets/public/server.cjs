"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_multer = __toESM(require("multer"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var import_genai = require("@google/genai");
var import_vite = require("vite");
var import_cors = __toESM(require("cors"), 1);
var app = (0, import_express.default)();
var PORT = process.env.PORT || 3e3;
app.use((0, import_cors.default)());
app.use(import_express.default.json());
var upload = (0, import_multer.default)({ storage: import_multer.default.memoryStorage() });
var MOCK_BREACH_DB = {
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
app.post("/api/scan", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded." });
    }
    const hash = import_crypto.default.createHash("sha256").update(file.buffer).digest("hex");
    const filename = file.originalname;
    const fileSize = file.size;
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
    if (process.env.GEMINI_API_KEY) {
      const ai = new import_genai.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
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
          contents: prompt
        });
        let aiResultStr = response.text || "{}";
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
app.post("/api/breach", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required." });
  if (MOCK_BREACH_DB[email.toLowerCase()]) {
    return res.json({
      breached: true,
      email,
      breaches: MOCK_BREACH_DB[email.toLowerCase()]
    });
  }
  if (email.length > 20) {
    return res.json({
      breached: true,
      email,
      breaches: [
        {
          source: "Generic Forum Dump",
          date: "Oct 2024",
          description: "A database containing long emails was dumped.",
          compromised_data: ["Email Address"]
        }
      ]
    });
  }
  res.json({ breached: false, email, breaches: [] });
});
app.post("/api/phishing", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL required." });
  const urlLower = url.toLowerCase();
  let isPhishing = false;
  let reason = "";
  if (urlLower.includes("paypal.com.biz") || urlLower.includes("secure-login-") || urlLower.includes("update-account-")) {
    isPhishing = true;
    reason = "URL contains known deceptive patterns.";
  } else if (urlLower.includes("win-iphone") || urlLower.includes("free-money")) {
    isPhishing = true;
    reason = "URL contains scam keywords.";
  }
  if (!isPhishing && process.env.GEMINI_API_KEY) {
    try {
      const ai = new import_genai.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Analyze this URL for phishing or scam indicators: ${url}. 
Does it try to look like a legitimate brand but use a weird domain? Does it use deceptive subdomains?
Reply with JSON: {"phishing": boolean, "reason": "string"}`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });
      let aiResultStr = response.text || "{}";
      aiResultStr = aiResultStr.replace(/```json/g, "").replace(/```/g, "").trim();
      const aiResult = JSON.parse(aiResultStr);
      if (aiResult.phishing) {
        isPhishing = true;
        reason = aiResult.reason || "Flagged by AI analysis.";
      }
    } catch (err) {
      console.error("Gemini phishing analysis failed:", err);
    }
  }
  res.json({
    phishing: isPhishing,
    url,
    reason: isPhishing ? reason : "No threats detected."
  });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
