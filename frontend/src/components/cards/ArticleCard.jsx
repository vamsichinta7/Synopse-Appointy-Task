function ArticleCard({ item }) {
  return (
    <>
      {item.metadata?.imageUrl && (
        <div className="mb-4 -mx-5 -mt-5 rounded-t-xl overflow-hidden">
          <img
            src={item.metadata.imageUrl}
            alt={item.title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 break-words">
        {item.title}
      </h3>

      {/* Author and Source Information */}
      <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-gray-500">
        {item.metadata?.author && (
          <span className="break-words">By {item.metadata.author}</span>
        )}
        {item.metadata?.sourceName && (
          <>
            {item.metadata?.author && <span>•</span>}
            <span className="break-words">{item.metadata.sourceName}</span>
          </>
        )}
      </div>

      {/* Summary */}
      <p className="text-gray-400 text-sm mb-3 line-clamp-3 break-words">{item.summary}</p>

      {/* Key Points */}
      {item.keyPoints && item.keyPoints.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-2 font-medium">Key Points:</p>
          <ul className="space-y-1">
            {item.keyPoints.slice(0, 3).map((point, index) => (
              <li key={index} className="text-xs text-gray-400 flex items-start">
                <span className="text-primary-400 mr-2 flex-shrink-0">•</span>
                <span className="line-clamp-2 break-words">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Source URL */}
      {item.metadata?.url && (
        <a
          href={item.metadata.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary-400 hover:text-primary-300 transition-colors break-all block"
        >
          View original article →
        </a>
      )}
    </>
  );
}

export default ArticleCard;
