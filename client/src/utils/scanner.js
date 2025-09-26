export class AdvancedPhishingScanner {
  constructor() {
    this.initializePatterns();
  }

  initializePatterns() {
    this.patterns = {
      urgency: {
        keywords: [
          "urgent",
          "immediate action",
          "act now",
          "expires today",
          "limited time",
          "deadline",
          "suspension",
          "expire",
          "within 24 hours",
          "verify now",
          "act immediately",
          "time sensitive",
          "hurry",
          "don't delay",
        ],
        weight: 25,
      },

      threat: {
        keywords: [
          "account suspended",
          "locked account",
          "security breach",
          "unauthorized access",
          "suspicious activity",
          "compromise",
          "violation",
          "terminated",
          "blocked",
          "penalty",
          "legal action",
          "court",
          "arrest",
          "fine",
        ],
        weight: 30,
      },

      credentials: {
        keywords: [
          "verify your account",
          "confirm identity",
          "update password",
          "reset password",
          "login credentials",
          "username",
          "ssn",
          "social security",
          "credit card",
          "bank account",
          "pin number",
          "account number",
          "routing number",
        ],
        weight: 35,
      },

      monetary: {
        keywords: [
          "payment failed",
          "billing issue",
          "refund",
          "prize",
          "lottery",
          "winner",
          "inheritance",
          "tax refund",
          "owed money",
          "claim now",
          "free money",
          "investment opportunity",
          "guaranteed return",
        ],
        weight: 20,
      },
    };

    this.suspiciousDomainPatterns = [
      /[0-9]+\.tk$/,
      /[0-9]+\.ml$/,
      /[0-9]+\.ga$/,
      /payp[a4]l/,
      /g[o0]{2}gle/,
      /micr[o0]s[o0]ft/,
      /[a4]mazon/,
      /[a4]pple/,
      /-security/,
      /-verification/,
      /-update/,
      /-notice/,
    ];
  }

  extractUrls(text) {
    const urlRegex = /https?:\/\/[^\s/$.?#].[^\s\])}"]*/gi;
    const matches = text.match(urlRegex) || [];

    return matches.map((url) => {
      try {
        const parsed = new URL(url);
        return {
          original: url,
          hostname: parsed.hostname.replace(/^www\./, ""),
          suspicious: this.isDomainSuspicious(parsed.hostname),
        };
      } catch {
        return {
          original: url,
          hostname: url,
          suspicious: true,
        };
      }
    });
  }

  isDomainSuspicious(hostname) {
    return this.suspiciousDomainPatterns.some((pattern) =>
      pattern.test(hostname)
    );
  }

  analyzeText(text, subject = "") {
    const fullText = (subject + " " + text).toLowerCase();
    const indicators = [];
    let totalScore = 0;

    for (const [category, config] of Object.entries(this.patterns)) {
      const matches = [];
      for (const keyword of config.keywords) {
        if (fullText.includes(keyword)) {
          matches.push(keyword);
        }
      }

      if (matches.length > 0) {
        const score = Math.min(
          config.weight,
          matches.length * (config.weight / 3)
        );
        totalScore += score;
        indicators.push({
          type: `${category}_keywords`,
          severity: this.getSeverityFromScore(score),
          matches: matches,
          score: score,
          description: `Contains ${category} keywords: ${matches.join(", ")}`,
        });
      }
    }

    return { indicators, score: totalScore };
  }

  analyzeUrls(urls) {
    const indicators = [];
    let score = 0;

    if (urls.length >= 5) {
      score += 30;
      indicators.push({
        type: "many_urls",
        severity: "high",
        score: 30,
        description: `Contains ${urls.length} URLs (suspicious)`,
      });
    }

    const suspiciousDomains = urls.filter((url) => url.suspicious);
    if (suspiciousDomains.length > 0) {
      const domainScore = Math.min(40, suspiciousDomains.length * 20);
      score += domainScore;
      indicators.push({
        type: "suspicious_domains",
        severity: "high",
        score: domainScore,
        domains: suspiciousDomains.map((d) => d.hostname),
        description: `Suspicious domains: ${suspiciousDomains
          .map((d) => d.hostname)
          .join(", ")}`,
      });
    }

    return { indicators, score };
  }

  getSeverityFromScore(score) {
    if (score >= 30) return "high";
    if (score >= 15) return "medium";
    return "low";
  }

  scan(emailContent) {
    const { text = "", subject = "" } = emailContent;
    const urls = this.extractUrls(text);

    const textAnalysis = this.analyzeText(text, subject);
    const urlAnalysis = this.analyzeUrls(urls);

    const allIndicators = [
      ...textAnalysis.indicators,
      ...urlAnalysis.indicators,
    ];
    const totalScore = Math.min(100, textAnalysis.score + urlAnalysis.score);

    let riskLevel;
    if (totalScore >= 50) riskLevel = "high";
    else if (totalScore >= 25) riskLevel = "medium";
    else if (totalScore >= 10) riskLevel = "low";
    else riskLevel = "minimal";

    return {
      riskScore: totalScore,
      riskLevel,
      indicators: allIndicators,
      urls: urls,
    };
  }
}

const scanner = new AdvancedPhishingScanner();

export function scanEmailAndReport(content) {
  const result = scanner.scan(content);

  const phishingReport = {
    reportedBy: "system",
    reportedAt: new Date(),
    reportType: "auto-scan",
    confidence: result.riskScore,
    emailData: {
      subjectHash: Buffer.from(content.subject).toString("base64"),
      contentSignature: Buffer.from(content.text).toString("base64"),
      urls: result.urls.map((u) => u.original),
    },
    analysis: {
      riskScore: result.riskScore,
      detectedPatterns: result.indicators.map((i) => i.description),
      verificationStatus: "pending",
    },
  };

  return { riskLevel: result.riskLevel, phishingReport };
}
