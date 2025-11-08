import { SERVER_BASE_URL } from '../../utils/api';
import { useState } from 'react';
import { HiPhotograph, HiZoomIn } from 'react-icons/hi';

function ImageCard({ item }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageClick = () => {
    // Open image in new tab for full view
    window.open(`${SERVER_BASE_URL}${item.metadata.filePath}`, '_blank');
  };

  // Filter out noisy OCR text (check if it's mostly garbage characters)
  const isValidOCRText = (text) => {
    if (!text || text.length < 10) return false;
    // Check if text has a reasonable ratio of alphanumeric characters
    const alphanumeric = text.match(/[a-zA-Z0-9]/g) || [];
    const ratio = alphanumeric.length / text.length;
    return ratio > 0.3; // At least 30% should be normal characters
  };

  const displayOCRText = item.content && isValidOCRText(item.content);

  return (
    <>
      {/* Image Display */}
      {item.metadata?.filePath && !imageError && (
        <div className="mb-4 -mx-5 -mt-5 rounded-t-xl overflow-hidden bg-dark-800 relative group">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-pulse flex flex-col items-center">
                <HiPhotograph className="text-4xl text-gray-600 mb-2" />
                <p className="text-sm text-gray-500">Loading image...</p>
              </div>
            </div>
          )}
          <img
            src={`${SERVER_BASE_URL}${item.metadata.filePath}`}
            alt={item.title}
            className={`w-full h-auto max-h-96 object-contain cursor-pointer transition-all duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              console.error('Image failed to load:', `${SERVER_BASE_URL}${item.metadata.filePath}`);
              setImageError(true);
            }}
            onClick={handleImageClick}
          />
          {imageLoaded && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="bg-dark-900/90 px-4 py-2 rounded-lg flex items-center space-x-2">
                <HiZoomIn className="text-xl text-white" />
                <span className="text-white text-sm font-medium">Click to view full size</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Image Error State */}
      {imageError && (
        <div className="mb-4 -mx-5 -mt-5 rounded-t-xl overflow-hidden bg-dark-800 p-8 text-center">
          <HiPhotograph className="text-5xl text-gray-600 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Image could not be loaded</p>
          <p className="text-xs text-gray-600 mt-1">{item.metadata.filePath}</p>
        </div>
      )}

      <h3 className="text-lg font-semibold text-white mb-2 break-words">{item.title}</h3>

      {/* File Info */}
      {item.metadata?.fileName && (
        <div className="mb-3 flex items-center text-xs text-gray-500">
          <HiPhotograph className="mr-1" />
          <span>{item.metadata.fileName}</span>
          {item.metadata?.fileSize && (
            <span className="ml-2">
              ({(item.metadata.fileSize / 1024).toFixed(1)} KB)
            </span>
          )}
        </div>
      )}

      {/* Caption */}
      {item.metadata?.caption && (
        <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-3 mb-3">
          <p className="text-xs text-gray-500 mb-1 font-medium">Caption:</p>
          <p className="text-sm text-gray-300 break-words">{item.metadata.caption}</p>
        </div>
      )}

      {/* AI Summary */}
      {item.summary && (
        <div className="mb-3 bg-dark-700/30 rounded-lg p-3 border border-dark-600">
          <p className="text-xs text-primary-400 mb-2 font-medium flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            AI Analysis
          </p>
          <p className="text-gray-300 text-sm break-words leading-relaxed">{item.summary}</p>
        </div>
      )}

      {/* Key Points */}
      {item.keyPoints && item.keyPoints.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-2 font-medium">Key Points:</p>
          <ul className="space-y-1">
            {item.keyPoints.map((point, index) => (
              <li key={index} className="text-sm text-gray-300 flex items-start">
                <span className="text-primary-400 mr-2">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Extracted OCR Text - Only show if it's valid text */}
      {displayOCRText && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-2 font-medium">Extracted Text (OCR):</p>
          <div className="bg-dark-700/50 rounded-lg p-3 max-h-40 overflow-y-auto border border-dark-600">
            <p className="text-sm text-gray-300 break-words whitespace-pre-wrap leading-relaxed">
              {item.content}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default ImageCard;
