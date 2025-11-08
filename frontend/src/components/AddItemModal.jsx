import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiLink, HiUpload, HiPencil } from 'react-icons/hi';
import { FaYoutube } from 'react-icons/fa';
import { useItemsStore } from '../store/itemsStore';
import toast from 'react-hot-toast';

function AddItemModal({ isOpen, onClose }) {
  const [mode, setMode] = useState('url'); // url, file, text, youtube
  const [url, setUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState(''); // User-selected category
  const [loading, setLoading] = useState(false);

  const { createItem, uploadFile } = useItemsStore();

  // Category options
  const categories = [
    { value: '', label: 'Auto-detect (AI will choose)' },
    { value: 'article', label: 'Article' },
    { value: 'product', label: 'Product' },
    { value: 'todo', label: 'To-Do' },
    { value: 'video', label: 'Video' },
    { value: 'book', label: 'Book' },
    { value: 'paper', label: 'Paper' },
    { value: 'idea', label: 'Idea' },
    { value: 'note', label: 'Note' },
    { value: 'others', label: 'Others' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Parse tags into array
      const tagsArray = tags
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0);

      if (mode === 'url') {
        await createItem({ url, type: 'web', caption, tags: tagsArray, category: category || undefined });
        toast.success('URL saved successfully!');
      } else if (mode === 'youtube') {
        await createItem({ url: youtubeUrl, type: 'youtube', caption, tags: tagsArray, category: category || undefined });
        toast.success('YouTube video saved successfully!');
      } else if (mode === 'text') {
        await createItem({ content: text, type: 'text', caption, tags: tagsArray, category: category || undefined });
        toast.success('Note saved successfully!');
      } else if (mode === 'file' && file) {
        await uploadFile(file, caption, tagsArray, category || undefined);
        toast.success('File uploaded successfully!');
      }

      // Reset and close
      setUrl('');
      setYoutubeUrl('');
      setText('');
      setFile(null);
      setCaption('');
      setTags('');
      setCategory('');
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="glass rounded-2xl w-full max-w-2xl p-6 border border-dark-600">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Add to Brain</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                >
                  <HiX className="text-xl text-gray-400" />
                </button>
              </div>

              {/* Mode Selector */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                <button
                  onClick={() => setMode('url')}
                  className={`flex items-center justify-center space-x-2 py-3 rounded-lg transition-all ${
                    mode === 'url'
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                  }`}
                >
                  <HiLink />
                  <span>URL</span>
                </button>
                <button
                  onClick={() => setMode('youtube')}
                  className={`flex items-center justify-center space-x-2 py-3 rounded-lg transition-all ${
                    mode === 'youtube'
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                  }`}
                >
                  <FaYoutube />
                  <span>YouTube</span>
                </button>
                <button
                  onClick={() => setMode('file')}
                  className={`flex items-center justify-center space-x-2 py-3 rounded-lg transition-all ${
                    mode === 'file'
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                  }`}
                >
                  <HiUpload />
                  <span>Upload File</span>
                </button>
                <button
                  onClick={() => setMode('text')}
                  className={`flex items-center justify-center space-x-2 py-3 rounded-lg transition-all ${
                    mode === 'text'
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                  }`}
                >
                  <HiPencil />
                  <span>Text Note</span>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                {mode === 'url' && (
                  <div className="mb-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Enter URL
                      </label>
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com/article"
                        required
                        className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Paste any URL - article, product, video, or webpage
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Caption (Optional)
                      </label>
                      <input
                        type="text"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Add a personal note or caption..."
                        className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Tags (Optional)
                      </label>
                      <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="work, important, ideas (comma separated)"
                        className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Separate tags with commas. AI will also suggest tags automatically.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Category (Optional)
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors"
                      >
                        {categories.map(cat => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-2">
                        Choose a category or let AI auto-detect it for you
                      </p>
                    </div>
                  </div>
                )}

                {mode === 'youtube' && (
                  <div className="mb-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        YouTube URL
                      </label>
                      <input
                        type="url"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        required
                        className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Paste a YouTube video link - it will be embedded and playable
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Caption (Optional)
                      </label>
                      <input
                        type="text"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Add a personal note or caption..."
                        className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Tags (Optional)
                      </label>
                      <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="work, important, ideas (comma separated)"
                        className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Separate tags with commas. AI will also suggest tags automatically.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Category (Optional)
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors"
                      >
                        {categories.map(cat => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-2">
                        Choose a category or let AI auto-detect it for you
                      </p>
                    </div>
                  </div>
                )}

                {mode === 'file' && (
                  <div className="mb-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Upload File
                      </label>
                      <div className="border-2 border-dashed border-dark-600 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
                        <input
                          type="file"
                          onChange={(e) => setFile(e.target.files[0])}
                          accept="image/*,.pdf,.txt"
                          className="hidden"
                          id="file-upload"
                          required
                        />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer"
                        >
                          <HiUpload className="text-4xl text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-400">
                            {file ? file.name : 'Click to upload or drag and drop'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Images (OCR enabled), PDFs, or text files
                          </p>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Caption (Optional)
                      </label>
                      <textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Add a caption or description for this file..."
                        rows={3}
                        className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Tags (Optional)
                      </label>
                      <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="work, important, ideas (comma separated)"
                        className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Separate tags with commas. AI will also suggest tags automatically.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Category (Optional)
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors"
                      >
                        {categories.map(cat => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-2">
                        Choose a category or let AI auto-detect it for you
                      </p>
                    </div>
                  </div>
                )}

                {mode === 'text' && (
                  <div className="mb-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Write your note
                      </label>
                      <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Start writing..."
                        required
                        rows={8}
                        className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Caption (Optional)
                      </label>
                      <input
                        type="text"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Add a personal note or caption..."
                        className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Tags (Optional)
                      </label>
                      <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="work, important, ideas (comma separated)"
                        className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Separate tags with commas. AI will also suggest tags automatically.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Category (Optional)
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors"
                      >
                        {categories.map(cat => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-2">
                        Choose a category or let AI auto-detect it for you
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-ghost"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Processing...</span>
                      </span>
                    ) : (
                      'Save to Brain'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default AddItemModal;
