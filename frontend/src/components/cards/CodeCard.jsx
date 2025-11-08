import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

function CodeCard({ item }) {
  const codeSnippet = item.content?.substring(0, 500);

  return (
    <>
      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
        {item.title}
      </h3>

      <p className="text-gray-400 text-sm mb-3">{item.summary}</p>

      {codeSnippet && (
        <div className="rounded-lg overflow-hidden mb-3">
          <SyntaxHighlighter
            language="javascript"
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              fontSize: '0.75rem',
              maxHeight: '200px',
            }}
          >
            {codeSnippet}
          </SyntaxHighlighter>
        </div>
      )}

      {item.keyPoints && item.keyPoints.length > 0 && (
        <ul className="space-y-1">
          {item.keyPoints.slice(0, 3).map((point, index) => (
            <li key={index} className="text-xs text-gray-400 flex items-start">
              <span className="text-primary-400 mr-2">•</span>
              <span className="line-clamp-1">{point}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default CodeCard;
