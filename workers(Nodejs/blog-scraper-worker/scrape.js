const axios = require("axios");
const cheerio = require("cheerio");

const BASE_URL = "https://beyondchats.com";
const LARAVEL_API = "http://127.0.0.1:8000/api/articles";

async function getLastPageNumber() {
  const { data } = await axios.get(`${BASE_URL}/blogs/`);
  const $ = cheerio.load(data);

  let lastPage = 1;

  $(".ct-pagination a.page-numbers").each((_, el) => {
    const href = $(el).attr("href");
    const match = href?.match(/\/page\/(\d+)\//);
    if (match) {
      lastPage = Math.max(lastPage, parseInt(match[1], 10));
    }
  });

  return lastPage;
}

/**
 * Get articles from a specific page
 */
async function getArticlesFromPage(page) {
  const url =
    page === 1
      ? `${BASE_URL}/blogs/`
      : `${BASE_URL}/blogs/page/${page}/`;

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const articles = [];

    $("article.entry-card").each((_, el) => {
      const title = $(el).find("h2.entry-title a").text().trim();
      const link = $(el).find("h2.entry-title a").attr("href");

      if (title && link) {
        articles.push({ title, url: link });
      }
    });

    return articles;
  } catch (err) {
    if (err.response?.status === 404) {
      console.warn(`⚠️ Page ${page} not found, skipping`);
      return [];
    }
    throw err;
  }
}

async function getFiveOldestArticles() {
  const lastPage = await getLastPageNumber();
  const collected = [];

  for (let page = lastPage; page >= 1 && collected.length < 5; page--) {
    console.log(`📄 Fetching page ${page}`);
    const articles = await getArticlesFromPage(page);

    for (let i = articles.length - 1; i >= 0 && collected.length < 5; i--) {
      collected.push(articles[i]);
    }
  }

  return collected.reverse();
}

/**
 * Fetch full article content
 */
async function getFullArticleContent(article) {
  try {
    const { data } = await axios.get(article.url);
    const $ = cheerio.load(data);


    let content = "";

    $(".elementor-widget-theme-post-content p").each((_, el) => {
      content += $(el)
        .contents()
        .filter((_, node) => node.type === "text" || node.type === "tag")
        .text()
        .replace(/\s+/g, " ")
        .trim();
    });

    return { ...article, content: content.trim() };
  } catch (err) {
    console.warn(err, "\n");

    console.warn(`⚠️ Article failed, skipping: ${article.url}`);
    return null;
  }
}

async function pushToLaravel(article) {
  try {
    await axios.post(LARAVEL_API, {
      title: article.title,
      content: article.content,
      source_url: article.url,
    });

    console.log(`✅ Saved to DB: ${article.title}`);
  } catch (err) {
    console.error(
      "❌ Failed to push:",
      err.response?.data || err.message
    );
  }
}


(async () => {
  try {
    console.log("🚀 Scraping & pushing oldest articles...\n");

    const articles = await getFiveOldestArticles();

    for (const article of articles) {
      console.log(article);

      const fullArticle = await getFullArticleContent(article);

      console.log(fullArticle.content);

      if (!fullArticle || !fullArticle.content) {
        console.warn(`⚠️ Empty article skipped: ${article.url}`);
        continue;
      }

      await pushToLaravel(fullArticle);
    }

    console.log("\n✅ DONE: Articles pushed to Laravel → Neon");
  } catch (err) {
    console.error("❌ Fatal error:", err.message);
  }
})();
