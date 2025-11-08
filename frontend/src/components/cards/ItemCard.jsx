import { motion, AnimatePresence } from 'framer-motion';
import { HiDotsVertical, HiStar, HiTrash, HiArchive, HiExternalLink, HiChevronDown, HiChevronUp } from 'react-icons/hi';
import { useState } from 'react';
import { format } from 'date-fns';

// Import specific card types
import ArticleCard from './ArticleCard';
import ProductCard from './ProductCard';
import TodoCard from './TodoCard';
import QuoteCard from './QuoteCard';
import VideoCard from './VideoCard';
import ImageCard from './ImageCard';
import BookCard from './BookCard';
import CodeCard from './CodeCard';
import PaperCard from './PaperCard';
import IdeaCard from './IdeaCard';

function ItemCard({ item, onDelete, onUpdate }) {
  const [showMenu, setShowMenu] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleFavorite = () => {
    onUpdate(item._id, { isFavorite: !item.isFavorite });
  };

  const handleArchive = () => {
    onUpdate(item._id, { isArchived: true });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      onDelete(item._id);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Render specific card type based on visual style
  const renderCard = () => {
    switch (item.category) {
      case 'article':
        return <ArticleCard item={item} />;
      case 'product':
        return <ProductCard item={item} />;
      case 'todo':
        return <TodoCard item={item} onUpdate={onUpdate} />;
      case 'quote':
        return <QuoteCard item={item} />;
      case 'video':
        return <VideoCard item={item} />;
      case 'image':
        return <ImageCard item={item} />;
      case 'book':
        return <BookCard item={item} />;
      case 'code':
        return <CodeCard item={item} />;
      case 'paper':
        return <PaperCard item={item} />;
      case 'idea':
        return <IdeaCard item={item} />;
      default:
        return <DefaultCard item={item} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className="card-interactive relative group"
    >
      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        <span className="inline-block px-2.5 py-1 text-xs font-medium rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20">
          {item.category}
        </span>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleFavorite}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              item.isFavorite
                ? 'text-yellow-400 hover:text-yellow-500 hover:scale-110'
                : 'text-gray-400 hover:text-yellow-400 hover:scale-110'
            }`}
            title={item.isFavorite ? 'Unstar this item' : 'Star this item'}
          >
            <HiStar className={`text-xl ${item.isFavorite ? 'fill-current' : ''}`} />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg hover:bg-dark-700 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <HiDotsVertical />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-40 glass rounded-lg shadow-xl border border-dark-600 overflow-hidden z-10">
                <button
                  onClick={handleArchive}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-left text-sm hover:bg-dark-700 transition-colors cursor-pointer"
                >
                  <HiArchive />
                  <span>Archive</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-dark-700 transition-colors cursor-pointer"
                >
                  <HiTrash />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Original URL Link - Prominent Display */}
      {item.metadata?.url && (
        <a
          href={item.metadata.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block mb-3 p-2 bg-dark-700/50 rounded-lg border border-dark-600 hover:border-primary-500/50 transition-colors group/link"
        >
          <div className="flex items-center space-x-2 text-xs">
            <HiExternalLink className="text-primary-400 flex-shrink-0" />
            <span className="text-gray-400 group-hover/link:text-primary-400 transition-colors truncate">
              {item.metadata.url}
            </span>
          </div>
        </a>
      )}

      {/* Caption */}
      {item.caption && (
        <div className="mb-3 p-3 bg-primary-500/5 border border-primary-500/20 rounded-lg">
          <p className="text-sm text-gray-300 italic">{item.caption}</p>
        </div>
      )}

      {/* Card Content */}
      {renderCard()}

      {/* Expandable Section */}
      <div className="mt-4">
        <button
          onClick={toggleExpand}
          className="flex items-center space-x-2 text-sm text-primary-400 hover:text-primary-300 transition-colors cursor-pointer"
        >
          {isExpanded ? <HiChevronUp /> : <HiChevronDown />}
          <span>{isExpanded ? 'Show less' : 'Show more details'}</span>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-4">
                {/* Full Summary */}
                {item.summary && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 mb-2">Summary</h4>
                    <p className="text-sm text-gray-300">{item.summary}</p>
                  </div>
                )}

                {/* Key Points */}
                {item.keyPoints && item.keyPoints.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 mb-2">Key Points</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {item.keyPoints.map((point, index) => (
                        <li key={index} className="text-sm text-gray-300">{point}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actionable Items */}
                {item.actionableItems && item.actionableItems.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 mb-2">Action Items</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {item.actionableItems.map((action, index) => (
                        <li key={index} className="text-sm text-primary-300">{action}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Full Content */}
                {item.content && item.content.length > 100 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 mb-2">Full Content</h4>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{item.content}</p>
                  </div>
                )}

                {/* Metadata */}
                {item.metadata && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 mb-2">Metadata</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {item.metadata.author && (
                        <div>
                          <span className="text-gray-500">Author:</span>
                          <span className="text-gray-300 ml-1">{item.metadata.author}</span>
                        </div>
                      )}
                      {item.metadata.sourceName && (
                        <div>
                          <span className="text-gray-500">Source:</span>
                          <span className="text-gray-300 ml-1">{item.metadata.sourceName}</span>
                        </div>
                      )}
                      {item.metadata.price && (
                        <div>
                          <span className="text-gray-500">Price:</span>
                          <span className="text-gray-300 ml-1">{item.metadata.currency || '$'}{item.metadata.price}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {item.tags.map((tag, index) => (
            <span
              key={index}
              className="tag text-xs"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-dark-700 flex items-center justify-between text-xs text-gray-500">
        <span>{format(new Date(item.createdAt), 'MMM dd, yyyy')}</span>
        {item.metadata?.sourceName && (
          <span className="text-gray-400">{item.metadata.sourceName}</span>
        )}
      </div>
    </motion.div>
  );
}

// Default card for unknown types
function DefaultCard({ item }) {
  return (
    <>
      <h3 className="text-lg font-semibold text-white mb-2 break-words">{item.title}</h3>
      <p className="text-gray-400 text-sm line-clamp-3 break-words">{item.summary}</p>
    </>
  );
}

export default ItemCard;
