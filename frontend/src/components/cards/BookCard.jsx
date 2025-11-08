function BookCard({ item }) {
  return (
    <>
      {item.metadata?.imageUrl && (
        <div className="mb-4 flex justify-center">
          <img
            src={item.metadata.imageUrl}
            alt={item.title}
            className="h-56 object-cover rounded-lg shadow-2xl"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2">
        {item.title}
      </h3>

      {item.metadata?.author && (
        <p className="text-sm text-primary-400 mb-3">by {item.metadata.author}</p>
      )}

      <p className="text-gray-400 text-sm line-clamp-4">{item.summary}</p>

      {item.keyPoints && item.keyPoints.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-2">Key takeaways:</p>
          <ul className="space-y-1">
            {item.keyPoints.slice(0, 3).map((point, index) => (
              <li key={index} className="text-xs text-gray-400 flex items-start">
                <span className="text-primary-400 mr-2">•</span>
                <span className="line-clamp-1">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

export default BookCard;
