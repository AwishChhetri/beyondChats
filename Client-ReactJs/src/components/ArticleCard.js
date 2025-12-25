import { useState } from "react";

export default function ArticleCard({ article }) {
  const isProcessed = article.is_generated;

  const [expandOriginal, setExpandOriginal] = useState(false);
  const [expandUpdated, setExpandUpdated] = useState(false);

  const truncate = (text, limit = 200) => {
    if (!text) return "";
    if (text.length <= limit) return text;
    return text.slice(0, limit) + "...";
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white">
      {/* Title + status */}
      <div className="flex justify-between items-start gap-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {article.title}
        </h2>

        <span
          className={`text-xs px-2 py-1 rounded font-medium ${
            isProcessed
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {isProcessed ? "Processed" : "Pending"}
        </span>
      </div>

      {/* Original content */}
      <p className="text-sm text-gray-700 mb-2">
        {expandOriginal
          ? article.content
          : truncate(article.content)}
      </p>

      {article.content?.length > 200 && (
        <button
          onClick={() => setExpandOriginal(!expandOriginal)}
          className="text-xs text-blue-600 hover:underline mb-4"
        >
          {expandOriginal ? "Show less" : "Read more"}
        </button>
      )}

      {/* AI Enhanced content */}
      {article.updated_content && (
        <div className="p-4 bg-gray-50 rounded border mb-4">
          <p className="text-xs font-semibold text-gray-600 mb-2">
            AI Enhanced
          </p>

          <p className="text-sm text-gray-700">
            {expandUpdated
              ? article.updated_content
              : truncate(article.updated_content)}
          </p>

          {article.updated_content.length > 200 && (
            <button
              onClick={() => setExpandUpdated(!expandUpdated)}
              className="text-xs text-blue-600 hover:underline mt-2"
            >
              {expandUpdated ? "Show less" : "Read more"}
            </button>
          )}
        </div>
      )}

      {/* Source */}
      {article.source_url && (
        <a
          href={article.source_url}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          View source →
        </a>
      )}
    </div>
  );
}
