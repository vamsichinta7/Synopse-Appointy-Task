function VideoCard({ item }) {
  return (
    <>
      {item.metadata?.videoEmbed && (
        <div className="mb-4 -mx-5 -mt-5 rounded-t-xl overflow-hidden aspect-video">
          <iframe
            src={item.metadata.videoEmbed}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      )}

      {!item.metadata?.videoEmbed && item.metadata?.imageUrl && (
        <div className="mb-4 -mx-5 -mt-5 rounded-t-xl overflow-hidden relative group">
          <img
            src={item.metadata.imageUrl}
            alt={item.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 break-words">
        {item.title}
      </h3>

      {item.metadata?.author && (
        <p className="text-sm text-gray-500 mb-2 break-words">{item.metadata.author}</p>
      )}

      <p className="text-gray-400 text-sm line-clamp-3 break-words">{item.summary}</p>
    </>
  );
}

export default VideoCard;
