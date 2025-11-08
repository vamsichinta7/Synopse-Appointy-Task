import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiLightningBolt, HiTrendingUp, HiChartBar, HiTag } from 'react-icons/hi';
import api from '../utils/api';
import toast from 'react-hot-toast';

const timeframes = [
  { value: 'day', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
];

function Reflection() {
  const [timeframe, setTimeframe] = useState('week');
  const [reflection, setReflection] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReflection();
    fetchStats();
  }, [timeframe]);

  const fetchReflection = async () => {
    setLoading(true);
    try {
      const response = await api.post('/reflection', { timeframe });
      setReflection(response.data);
    } catch (error) {
      toast.error('Failed to generate reflection');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/reflection/stats', {
        params: { timeframe }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Stats error:', error);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          <HiLightningBolt className="inline-block mr-2 text-yellow-400" />
          Brain Reflection
        </h1>
        <p className="text-gray-400">
          Insights and patterns from your second brain
        </p>
      </div>

      {/* Timeframe Selector */}
      <div className="mb-8 flex space-x-3">
        {timeframes.map((tf) => (
          <button
            key={tf.value}
            onClick={() => setTimeframe(tf.value)}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              timeframe === tf.value
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
        </div>
      )}

      {!loading && reflection && (
        <div className="space-y-6">
          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card bg-gradient-to-br from-primary-600/20 to-primary-800/20 border-primary-500/30"
          >
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">{reflection.title}</h2>
              <span className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm font-medium border border-primary-500/30">
                {reflection.itemCount || 0} items
              </span>
            </div>
            <p className="text-gray-300 leading-relaxed text-lg">
              {reflection.summary}
            </p>
          </motion.div>

          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Items */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="card"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-gray-400 font-medium">Total Saved</h3>
                  <HiChartBar className="text-2xl text-primary-400" />
                </div>
                <p className="text-4xl font-bold text-white">{stats.totalItems}</p>
              </motion.div>

              {/* Top Category */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="card"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-gray-400 font-medium">Top Category</h3>
                  <HiTrendingUp className="text-2xl text-green-400" />
                </div>
                <p className="text-2xl font-bold text-white capitalize">
                  {stats.categoryBreakdown?.[0]?._id || 'None'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.categoryBreakdown?.[0]?.count || 0} items
                </p>
              </motion.div>

              {/* Top Tag */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="card"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-gray-400 font-medium">Top Tag</h3>
                  <HiTag className="text-2xl text-yellow-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  #{stats.topTags?.[0]?.tag || 'None'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.topTags?.[0]?.count || 0} items
                </p>
              </motion.div>
            </div>
          )}

          {/* Themes */}
          {reflection.themes && reflection.themes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card"
            >
              <h3 className="text-xl font-bold text-white mb-4">Main Themes</h3>
              <div className="flex flex-wrap gap-3">
                {reflection.themes.map((theme, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-primary-500/10 text-primary-400 border border-primary-500/20 rounded-xl font-medium"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Insights */}
          {reflection.insights && reflection.insights.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card"
            >
              <h3 className="text-xl font-bold text-white mb-4">Key Insights</h3>
              <div className="space-y-3">
                {reflection.insights.map((insight, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-dark-700/50 rounded-lg"
                  >
                    <div className="w-6 h-6 bg-primary-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary-400 text-sm font-bold">{index + 1}</span>
                    </div>
                    <p className="text-gray-300">{insight}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Suggested Actions */}
          {reflection.suggested_actions && reflection.suggested_actions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card border-green-500/30 bg-green-500/5"
            >
              <h3 className="text-xl font-bold text-white mb-4">Suggested Actions</h3>
              <div className="space-y-2">
                {reflection.suggested_actions.map((action, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-dark-700/50 rounded-lg hover:bg-dark-700 transition-colors cursor-pointer"
                  >
                    <div className="w-5 h-5 border-2 border-green-400 rounded-md flex-shrink-0" />
                    <p className="text-gray-300">{action}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Category Breakdown */}
          {stats?.categoryBreakdown && stats.categoryBreakdown.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="card"
            >
              <h3 className="text-xl font-bold text-white mb-4">Category Breakdown</h3>
              <div className="space-y-3">
                {stats.categoryBreakdown.map((cat, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 capitalize">{cat._id}</span>
                      <span className="text-white font-medium">{cat.count}</span>
                    </div>
                    <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-600"
                        style={{
                          width: `${(cat.count / stats.totalItems) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

export default Reflection;
