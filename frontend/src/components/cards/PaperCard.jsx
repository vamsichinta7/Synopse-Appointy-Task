import { HiDocumentText } from 'react-icons/hi';

function PaperCard({ item }) {
  return (
    <>
      <div className="flex items-start space-x-3 mb-3">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center flex-shrink-0">
          <HiDocumentText className="text-2xl text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2">
            {item.title}
          </h3>

          {item.metadata?.author && (
            <p className="text-xs text-gray-500">
              {item.metadata.author}
              {item.metadata?.dateDetected && ` • ${new Date(item.metadata.dateDetected).getFullYear()}`}
            </p>
          )}
        </div>
      </div>

      <p className="text-gray-400 text-sm mb-3 line-clamp-3">{item.summary}</p>

      {item.keyPoints && item.keyPoints.length > 0 && (
        <div className="bg-dark-700/50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-2 font-semibold">Key Findings:</p>
          <ul className="space-y-1">
            {item.keyPoints.slice(0, 3).map((point, index) => (
              <li key={index} className="text-xs text-gray-400 flex items-start">
                <span className="text-primary-400 mr-2">{index + 1}.</span>
                <span className="line-clamp-2">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

export default PaperCard;
