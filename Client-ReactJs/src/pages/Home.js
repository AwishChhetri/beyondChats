import { useEffect, useState } from "react";
import ArticleList from "../components/ArticleList";

const API_URL = "http://127.0.0.1:8000/api/articles";

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        setArticles(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch articles:", err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header (UNCHANGED) */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Articles
          </h1>
          <p className="text-gray-600">
            Explore original and AI-enhanced articles.
          </p>
        </header>

        {/* Content */}
        {loading ? (
          <p className="text-gray-500">Loading articles...</p>
        ) : (
          <ArticleList articles={articles} />
        )}
      </div>
    </main>
  );
}
