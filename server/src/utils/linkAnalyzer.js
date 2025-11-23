import axios from "axios";
import crypto from "crypto";

/**
 * Link Analyzer for Phishing Detection
 * Uses multiple methods to check URLs for phishing indicators
 */

// Extract URLs from text
export function extractUrls(text) {
  if (!text) return [];
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;
  const matches = text.match(urlRegex) || [];
  return [...new Set(matches)]; // Remove duplicates
}

// Check URL using Google Safe Browsing API (if API key is available)
async function checkGoogleSafeBrowsing(url, apiKey) {
  if (!apiKey) return null;

  try {
    const urlHash = crypto.createHash("sha256").update(url).digest("hex");
    const response = await axios.post(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
      {
        client: {
          clientId: "inboxguard",
          clientVersion: "1.0.0",
        },
        threatInfo: {
          threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [{ url: url }],
        },
      },
      { timeout: 5000 }
    );

    if (response.data && response.data.matches && response.data.matches.length > 0) {
      return {
        isMalicious: true,
        threatType: response.data.matches[0].threatType,
        platformType: response.data.matches[0].platformType,
        source: "Google Safe Browsing",
      };
    }
    return { isMalicious: false, source: "Google Safe Browsing" };
  } catch (error) {
    console.error("Google Safe Browsing API error:", error.message);
    return null;
  }
}

// Check URL using URLScan.io API (free tier)
async function checkURLScan(url) {
  try {
    // First, submit URL for scanning
    const submitResponse = await axios.post(
      "https://urlscan.io/api/v1/scan/",
      {
        url: url,
        visibility: "public",
      },
      {
        headers: {
          "Content-Type": "application/json",
          "API-Key": process.env.URLSCAN_API_KEY || "",
        },
        timeout: 10000,
      }
    );

    if (submitResponse.data && submitResponse.data.uuid) {
      // Wait a bit and check result
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const resultResponse = await axios.get(
        `https://urlscan.io/api/v1/result/${submitResponse.data.uuid}/`,
        { timeout: 5000 }
      );

      if (resultResponse.data && resultResponse.data.verdicts) {
        const verdicts = resultResponse.data.verdicts;
        const isMalicious = 
          verdicts.overall?.malicious === true ||
          verdicts.overall?.suspicious === true ||
          verdicts.engines?.some((engine) => engine.malicious === true);

        return {
          isMalicious: isMalicious || false,
          source: "URLScan.io",
          verdicts: verdicts.overall,
        };
      }
    }
    return null;
  } catch (error) {
    // URLScan might not have API key or rate limited - that's okay
    return null;
  }
}

// Heuristic-based URL analysis
function analyzeUrlHeuristics(url) {
  const analysis = {
    riskScore: 0,
    riskFactors: [],
    isSuspicious: false,
  };

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // Check for suspicious TLDs
    const suspiciousTlds = [".tk", ".ml", ".ga", ".cf", ".click", ".download"];
    if (suspiciousTlds.some((tld) => hostname.endsWith(tld))) {
      analysis.riskScore += 20;
      analysis.riskFactors.push("Suspicious TLD");
    }

    // Check for URL shorteners
    const urlShorteners = [
      "bit.ly",
      "tinyurl.com",
      "goo.gl",
      "ow.ly",
      "is.gd",
      "t.co",
      "buff.ly",
      "short.link",
      "tiny.cc",
      "cutt.ly",
    ];
    if (urlShorteners.some((shortener) => hostname.includes(shortener))) {
      analysis.riskScore += 15;
      analysis.riskFactors.push("URL shortener detected");
    }

    // Check for IP addresses instead of domain names
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipRegex.test(hostname)) {
      analysis.riskScore += 25;
      analysis.riskFactors.push("IP address instead of domain");
    }

    // Check for suspicious subdomains
    const subdomainCount = hostname.split(".").length - 2;
    if (subdomainCount > 3) {
      analysis.riskScore += 10;
      analysis.riskFactors.push("Excessive subdomains");
    }

    // Check for typosquatting patterns (basic)
    const legitimateDomains = [
      "google.com",
      "microsoft.com",
      "apple.com",
      "amazon.com",
      "paypal.com",
      "facebook.com",
    ];
    const domainWithoutTld = hostname.split(".").slice(-2, -1)[0];
    legitimateDomains.forEach((legit) => {
      const legitDomain = legit.split(".")[0];
      if (
        domainWithoutTld !== legitDomain &&
        domainWithoutTld.includes(legitDomain)
      ) {
        analysis.riskScore += 30;
        analysis.riskFactors.push(`Possible typosquatting of ${legit}`);
      }
    });

    // Check for suspicious path patterns
    const suspiciousPaths = ["verify", "confirm", "update", "secure", "login"];
    if (suspiciousPaths.some((path) => urlObj.pathname.toLowerCase().includes(path))) {
      analysis.riskScore += 10;
      analysis.riskFactors.push("Suspicious URL path");
    }

    analysis.isSuspicious = analysis.riskScore >= 30;
  } catch (error) {
    // Invalid URL
    analysis.riskScore = 50;
    analysis.riskFactors.push("Invalid URL format");
    analysis.isSuspicious = true;
  }

  return analysis;
}

/**
 * Analyze URLs for phishing threats
 * @param {string[]} urls - Array of URLs to analyze
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzeUrls(urls) {
  if (!urls || urls.length === 0) {
    return {
      totalUrls: 0,
      maliciousUrls: [],
      suspiciousUrls: [],
      riskScore: 0,
      indicators: [],
    };
  }

  const maliciousUrls = [];
  const suspiciousUrls = [];
  const indicators = [];
  let maxRiskScore = 0;

  for (const url of urls.slice(0, 10)) {
    // Limit to 10 URLs to avoid rate limits
    let urlAnalysis = null;

    // Try Google Safe Browsing first (if API key available)
    if (process.env.GOOGLE_SAFE_BROWSING_API_KEY) {
      urlAnalysis = await checkGoogleSafeBrowsing(
        url,
        process.env.GOOGLE_SAFE_BROWSING_API_KEY
      );
    }

    // If not found malicious, try URLScan
    if (!urlAnalysis || !urlAnalysis.isMalicious) {
      urlAnalysis = await checkURLScan(url);
    }

    // Always run heuristics as fallback
    const heuristicAnalysis = analyzeUrlHeuristics(url);

    // Combine results
    if (urlAnalysis && urlAnalysis.isMalicious) {
      maliciousUrls.push({
        url,
        source: urlAnalysis.source,
        threatType: urlAnalysis.threatType,
      });
      indicators.push({
        type: "malicious_link",
        severity: "high",
        description: `Malicious URL detected: ${url} (${urlAnalysis.source})`,
        detected: true,
      });
      maxRiskScore = Math.max(maxRiskScore, 80);
    } else if (heuristicAnalysis.isSuspicious) {
      suspiciousUrls.push({
        url,
        riskScore: heuristicAnalysis.riskScore,
        riskFactors: heuristicAnalysis.riskFactors,
      });
      indicators.push({
        type: "suspicious_link",
        severity: heuristicAnalysis.riskScore >= 50 ? "high" : "medium",
        description: `Suspicious URL detected: ${url} - ${heuristicAnalysis.riskFactors.join(", ")}`,
        detected: true,
      });
      maxRiskScore = Math.max(maxRiskScore, heuristicAnalysis.riskScore);
    }
  }

  return {
    totalUrls: urls.length,
    maliciousUrls,
    suspiciousUrls,
    riskScore: maxRiskScore,
    indicators,
  };
}

