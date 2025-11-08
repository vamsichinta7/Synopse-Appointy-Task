function ProductCard({ item }) {
  return (
    <>
      {item.metadata?.imageUrl && (
        <div className="mb-4 -mx-5 -mt-5 rounded-t-xl overflow-hidden bg-white">
          <img
            src={item.metadata.imageUrl}
            alt={item.title}
            className="w-full h-56 object-contain p-4"
            onError={(e) => {
              e.target.parentElement.style.display = 'none';
            }}
          />
        </div>
      )}

      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
        {item.title}
      </h3>

      {item.metadata?.price && (
        <div className="mb-3">
          <span className="text-2xl font-bold text-primary-400">
            {item.metadata.currency || '$'}
            {item.metadata.price}
          </span>
        </div>
      )}

      <p className="text-gray-400 text-sm line-clamp-4">{item.summary}</p>

      {item.metadata?.sourceName && (
        <div className="mt-3 inline-block px-3 py-1 bg-dark-700 rounded-lg text-xs text-gray-400">
          {item.metadata.sourceName}
        </div>
      )}
    </>
  );
}

export default ProductCard;
