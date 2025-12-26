import { useEffect, useState } from "react";
import ArticleList from "../components/ArticleList";

const API_URL = "https://beyond-chats-ten.vercel.app/api/articles";

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
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Articles
          </h1>
          <p className="text-gray-600">
            Explore original and AI-enhanced articles.
          </p>
        </header>

        {loading ? (
          <p className="text-gray-500">Please wait! As the server takes a little while to respond.</p>
        ) : (
          <ArticleList articles={articles} />
        )}
      </div>
    </main>
  );
}
