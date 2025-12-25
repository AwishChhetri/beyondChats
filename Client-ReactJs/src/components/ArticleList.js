import ArticleCard from "./ArticleCard";

export default function ArticleList({ articles = [] }) {
  if (!articles.length) {
    return (
      <p className="text-gray-500 text-center">
        No articles found.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
