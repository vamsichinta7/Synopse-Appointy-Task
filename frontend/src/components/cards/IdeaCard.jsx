import { HiLightBulb } from 'react-icons/hi';

function IdeaCard({ item }) {
  return (
    <div className="relative">
      <div className="absolute top-0 right-0 text-yellow-400/20">
        <HiLightBulb className="text-5xl" />
      </div>

      <div className="relative z-10">
        <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">
          {item.title}
        </h3>

        <p className="text-gray-300 text-sm mb-4 leading-relaxed">
          {item.summary}
        </p>

        {item.keyPoints && item.keyPoints.length > 0 && (
          <div className="space-y-2">
            {item.keyPoints.map((point, index) => (
              <div
                key={index}
                className="flex items-start space-x-2 p-2 bg-primary-500/5 rounded-lg border-l-2 border-primary-500"
              >
                <span className="text-primary-400 font-bold text-xs mt-0.5">
                  {index + 1}
                </span>
                <p className="text-sm text-gray-300">{point}</p>
              </div>
            ))}
          </div>
        )}

        {item.actionableItems && item.actionableItems.length > 0 && (
          <div className="mt-4 pt-4 border-t border-dark-700">
            <p className="text-xs text-gray-500 mb-2 font-semibold">Next Steps:</p>
            <ul className="space-y-1">
              {item.actionableItems.map((action, index) => (
                <li key={index} className="text-xs text-gray-400 flex items-start">
                  <span className="text-green-400 mr-2">→</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default IdeaCard;
