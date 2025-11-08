import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiSearch, HiLightningBolt, HiSparkles, HiTag, HiGlobeAlt } from 'react-icons/hi';
import Masonry from 'react-masonry-css';
import api from '../utils/api';
import ItemCard from '../components/cards/ItemCard';
import WebResultCard from '../components/WebResultCard';
import { useItemsStore } from '../store/itemsStore';
import toast from 'react-hot-toast';

const exampleQueries = [
  "Articles about AI I saved last month",
  "Shoes under 3000 rupees",
  "Latest smartphones under 20000 rs",
  "What did Karpathy say about tokenization?",
  "Best laptops for programming",
  "Videos about system design",
];

function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [webResults, setWebResults] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const { deleteItem, updateItem } = useItemsStore();

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const response = await api.post('/search', { query: searchQuery });
      setResults(response.data.results || []);
      setWebResults(response.data.webResults || null);
      setAiInsights(response.data.aiInsights || null);

      const fileCount = response.data.results.length;
      const webCount = response.data.webResults?.results?.length || 0;

      if (fileCount === 0 && webCount === 0) {
        toast('No results found', { icon: '🔍' });
      } else if (fileCount > 0 && webCount > 0) {
        toast.success(`Found ${fileCount} files + ${webCount} web results`);
      } else if (fileCount > 0) {
        toast.success(`Found ${fileCount} results in your files`);
      } else {
        toast.success(`Found ${webCount} web results`);
      }
    } catch (error) {
      toast.error('Search failed');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (exampleQuery) => {
    setQuery(exampleQuery);
    handleSearch(exampleQuery);
  };

  const handleDelete = async (id) => {
    try {
      await deleteItem(id);
      setResults(results.filter(item => item._id !== id));
      toast.success('Item deleted');
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      await updateItem(id, data);
      setResults(results.map(item => item._id === id ? { ...item, ...data } : item));
      toast.success('Item updated');
    } catch (error) {
      toast.error('Failed to update item');
    }
  };

  const breakpointColumns = {
    default: 3,
    1400: 3,
    1024: 2,
    768: 1,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          <HiSearch className="inline-block mr-2" />
          Intelligent Search
        </h1>
        <p className="text-gray-400">
          Ask anything - search like you think
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="relative">
          <HiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Try "articles about AI I saved last month" or "that quote about new beginnings"'
            className="w-full pl-16 pr-24 py-5 bg-dark-800 border-2 border-dark-700 rounded-2xl text-white text-lg placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-all shadow-xl"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 btn-primary flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <HiLightningBolt />
                <span>Search</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Example Queries */}
      {!searched && (
        <div className="mb-12">
          <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">
            Try these examples:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {exampleQueries.map((example, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleExampleClick(example)}
                className="text-left p-4 bg-dark-800 hover:bg-dark-700 border border-dark-700 hover:border-primary-500/50 rounded-xl transition-all group"
              >
                <HiLightningBolt className="text-primary-400 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm text-gray-300 group-hover:text-white transition-colors">
                  "{example}"
                </p>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights Section */}
      {searched && !loading && aiInsights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 glass border border-primary-500/30 rounded-2xl p-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <HiSparkles className="text-2xl text-primary-400" />
            <h2 className="text-xl font-bold text-white">AI Insights</h2>
          </div>

          {/* Interpretation */}
          {aiInsights.interpretation && (
            <div className="mb-4">
              <p className="text-gray-300 text-lg leading-relaxed">
                {aiInsights.interpretation}
              </p>
            </div>
          )}

          {/* Key Findings */}
          {aiInsights.keyFindings && (
            <div className="mb-4 p-4 bg-primary-500/10 border border-primary-500/20 rounded-lg">
              <h3 className="text-sm font-semibold text-primary-400 mb-2 uppercase tracking-wider">
                Key Findings
              </h3>
              <p className="text-gray-300">{aiInsights.keyFindings}</p>
            </div>
          )}

          {/* Themes */}
          {aiInsights.themes && aiInsights.themes.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center">
                <HiTag className="mr-2" />
                Key Themes
              </h3>
              <div className="flex flex-wrap gap-2">
                {aiInsights.themes.map((theme, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-primary-500/20 text-primary-300 rounded-full text-sm font-medium border border-primary-500/30"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {aiInsights.suggestions && aiInsights.suggestions.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">
                Suggestions
              </h3>
              <ul className="space-y-2">
                {aiInsights.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-2 text-gray-300">
                    <span className="text-primary-400 mt-1">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Related Searches */}
          {aiInsights.relatedSearches && aiInsights.relatedSearches.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center">
                <HiSearch className="mr-2" />
                Related Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {aiInsights.relatedSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(search);
                      handleSearch(search);
                    }}
                    className="px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-gray-300 hover:text-white rounded-lg text-sm transition-all border border-dark-600 hover:border-primary-500/50 cursor-pointer"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Results */}
      {searched && !loading && (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">
              {results.length} {results.length === 1 ? 'result' : 'results'} found in your files
            </h2>
          </div>

          {results.length > 0 ? (
            <Masonry
              breakpointCols={breakpointColumns}
              className="masonry-grid"
              columnClassName="masonry-grid_column"
            >
              {results.map((item) => (
                <ItemCard
                  key={item._id}
                  item={item}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                />
              ))}
            </Masonry>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiSearch className="text-4xl text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No matching files found</h3>
              <p className="text-gray-400 mb-4">
                No files match your search in your uploaded content
              </p>
              {aiInsights && (
                <p className="text-primary-400">
                  Check the AI insights above for suggestions
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* Web Results Section */}
      {searched && !loading && webResults && webResults.results && webResults.results.length > 0 && (
        <div className="mt-12">
          {/* Web Results Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <HiGlobeAlt className="text-2xl text-primary-400" />
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Web Results
                </h2>
                <p className="text-sm text-gray-400">
                  {webResults.results.length} results from the web
                  {webResults.searchType === 'products' && ' • Shopping results'}
                </p>
              </div>
            </div>
          </div>

          {/* Web Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {webResults.results.map((result, index) => (
              <WebResultCard key={index} result={result} index={index} />
            ))}
          </div>

          {/* Web Search Info */}
          <div className="mt-6 p-4 bg-dark-800/50 border border-dark-700 rounded-lg">
            <p className="text-xs text-gray-500 flex items-center">
              <HiGlobeAlt className="mr-2" />
              These results are fetched from the web in real-time and may include shopping links, articles, and other relevant content.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Search;
