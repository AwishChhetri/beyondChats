require("dotenv").config();

const axios = require("axios");
const cheerio = require("cheerio");
const https = require("https");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const LARAVEL_API = process.env.LARAVEL_API;
const SERP_API_KEY = process.env.SERP_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const insecureAgent = new https.Agent({ rejectUnauthorized: false });

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

function sanitize(text = "") {
  return text.replace(/\u0000/g, "").normalize("NFKC");
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getLatestArticle() {
  const { data } = await axios.get(`${LARAVEL_API}/articles/latest`);

  if (!data || !data.title || data.is_generated === true) {
    process.exit(0); 
  }


  return data;
}

//the two top articles will be searched here
async function googleSearch(title) {
  const query = `FIND THE BEST ARTICLE ON TOPIC: ${title}`;

  const { data } = await axios.get("https://serpapi.com/search", {
    params: { q: query, api_key: SERP_API_KEY, num: 5 },
  });

  const results = (data.organic_results || [])
    .filter(r => r.link && r.title)
    .slice(0, 2)
    .map(r => ({ title: r.title, url: r.link }));

  return results;
}

//the content of the two site will be extracted heree
async function scrapeArticle(url, attempt = 1) {
  try {
    const { data } = await axios.get(url, {
      timeout: 30000,
      httpsAgent: insecureAgent,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      },
    });

    const $ = cheerio.load(data);
    let content = "";

    $("p").each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 60) content += text + "\n\n";
    });

    return sanitize(content);
  } catch (err) {
    if (attempt === 1) {
      return scrapeArticle(url, 2);
    }
    return "";
  }
}

//
async function rewriteWithGemini(original, ref1, ref2) {
  const prompt = `
      Rewrite the original article using the tone, structure, and depth
      of the reference articles. Improve clarity, formatting, and SEO.
      Do NOT copy text verbatim.

      Original:
      ${original}

      Reference 1:
      ${ref1}

      Reference 2:
      ${ref2}

      Return only the rewritten article.
      `;

  const result = await model.generateContent(prompt);
  return result.response.text();
}


async function updateArticle(id, updatedContent, references) {
  const finalContent = `
${updatedContent}

---

### References
${references.map(r => `- ${r.title}: ${r.url}`).join("\n")}
`;

  await axios.put(`${LARAVEL_API}/articles/${id}`, {
    updated_content: sanitize(finalContent),
    is_generated: true,
  });

}


(async () => {
  while (true) {
    const article = await getLatestArticle();
    if (!article) {
      break;
    }

    const references = await googleSearch(article.title);
    if (references.length < 2) {
      console.warn("⚠️ Not enough references — skipping");
      await sleep(2000);
      continue;
    }

    const refContents = [];
    for (const ref of references) {
      const content = await scrapeArticle(ref.url);
      refContents.push({ ...ref, content });
    }

    if (
      refContents.some(r => r.content.length < 300)
    ) {
      console.warn("⚠️ Weak reference content — skipping");
      await sleep(2000);
      continue;
    }

    const rewritten = await rewriteWithGemini(
      article.content,
      refContents[0].content,
      refContents[1].content
    );

    await updateArticle(article.id, rewritten, refContents);
    await sleep(3000);
  }
})();
