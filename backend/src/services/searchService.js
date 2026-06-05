const { tavily } = require("@tavily/core");
const { config } = require("../config");

const client = tavily({ apiKey: config.tavilyKey });

// trusted domains only — no random blogs or social media
const TRUSTED_DOMAINS = [
  
  "who.int",
  "nih.gov",
  "cdc.gov",
  "pubmed.ncbi.nlm.nih.gov",
  "nature.com",
  "science.org",

  "pib.gov.in",
  "mohfw.gov.in",
  "india.gov.in",
  "mygov.in",

  
  "boomlive.in",
  "altnews.in",
  "factchecker.in",
  "vishvasnews.com",
  "thequint.com",

  
  "thehindu.com",
  "ndtv.com",
  "indianexpress.com",
  "pti.in",

 
  "bbc.com",
  "reuters.com",
  "apnews.com",
];

async function searchTrustedSources(claim) {
  try {
    const response = await client.search(claim, {
      searchDepth: "advanced",
      maxResults: 5,
      includeDomains: TRUSTED_DOMAINS,
      includeAnswer: false,
    });

    // clean up results — only return what groqService needs
    return response.results.map((r) => ({
      title: r.title,
      content: r.content,
      url: r.url,
    }));

  } catch (err) {
    console.error("searchTrustedSources error:", err.message);
    return [];   // if search fails, verifier still runs with no evidence → UNVERIFIED
  }
}

module.exports = { searchTrustedSources };

//User submits text
//         ↓
// extractClaims()
//         ↓
// "The Earth is flat"
//         ↓
// searchTrustedSources()
//         ↓
// Reuters, BBC, WHO articles
//         ↓
// generateVerdict()
//         ↓
// FALSE
//         ↓
// Save in MongoDB