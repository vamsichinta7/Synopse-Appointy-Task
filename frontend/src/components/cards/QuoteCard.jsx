import { BsQuote } from 'react-icons/bs';

function QuoteCard({ item }) {
  return (
    <div className="relative">
      <BsQuote className="text-6xl text-primary-500/20 absolute -top-2 -left-2" />

      <div className="relative z-10 pt-6">
        <p className="text-lg text-gray-200 italic mb-4 leading-relaxed">
          "{item.summary || item.title}"
        </p>

        {item.metadata?.author && (
          <p className="text-sm text-gray-400 text-right">
            — {item.metadata.author}
          </p>
        )}

        {item.metadata?.sourceName && (
          <p className="text-xs text-gray-500 text-right mt-1">
            {item.metadata.sourceName}
          </p>
        )}
      </div>
    </div>
  );
}

export default QuoteCard;
