import { motion } from 'framer-motion';
import { HiExternalLink, HiGlobeAlt } from 'react-icons/hi';

function WebResultCard({ result, index }) {
  return (
    <motion.a
      href={result.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="block glass border border-dark-600 hover:border-primary-500/50 rounded-xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10 group cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* Favicon */}
          {result.favicon ? (
            <img
              src={result.favicon}
              alt=""
              className="w-5 h-5 rounded flex-shrink-0"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <HiGlobeAlt className="w-5 h-5 text-primary-400 flex-shrink-0" />
          )}

          {/* URL Domain */}
          <span className="text-xs text-gray-500 truncate">
            {new URL(result.url).hostname.replace('www.', '')}
          </span>
        </div>

        {/* External Link Icon */}
        <HiExternalLink className="w-5 h-5 text-gray-400 group-hover:text-primary-400 transition-colors flex-shrink-0" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-primary-300 transition-colors">
        {result.title}
      </h3>

      {/* Snippet */}
      {result.snippet && (
        <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed">
          {result.snippet}
        </p>
      )}

      {/* Product Badge */}
      {result.type === 'product' && (
        <div className="mt-3">
          <span className="inline-block px-2.5 py-1 text-xs font-medium rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
            Product
          </span>
        </div>
      )}

      {/* Full URL on hover */}
      <div className="mt-3 pt-3 border-t border-dark-700 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-xs text-primary-400 truncate">
          {result.url}
        </p>
      </div>
    </motion.a>
  );
}

export default WebResultCard;
