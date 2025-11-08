import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiMoon, HiSun, HiViewGrid } from 'react-icons/hi';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

function SettingsModal({ isOpen, onClose }) {
  const { user } = useAuthStore();
  const [settings, setSettings] = useState({
    theme: localStorage.getItem('theme') || 'dark',
    defaultView: localStorage.getItem('defaultView') || 'masonry',
    emailNotifications: localStorage.getItem('emailNotifications') === 'true',
  });

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem('theme', settings.theme);
    localStorage.setItem('defaultView', settings.defaultView);
    localStorage.setItem('emailNotifications', settings.emailNotifications);

    // Apply theme
    if (settings.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }

    toast.success('Settings saved successfully!');
    onClose();
  };

  const handleReset = () => {
    setSettings({
      theme: 'dark',
      defaultView: 'masonry',
      emailNotifications: false,
    });
    toast.success('Settings reset to defaults');
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
            <div className="glass rounded-2xl w-full max-w-2xl p-6 border border-dark-600 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Settings</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-dark-700 rounded-lg transition-colors cursor-pointer"
                >
                  <HiX className="text-xl text-gray-400" />
                </button>
              </div>

              {/* User Info */}
              <div className="mb-6 p-4 bg-dark-700/50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Account Information</h3>
                <p className="text-white font-medium">{user?.username}</p>
                <p className="text-gray-400 text-sm">{user?.email}</p>
              </div>

              {/* Theme Settings */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Appearance</h3>

                <div className="space-y-4">
                  {/* Theme Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Theme
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setSettings({ ...settings, theme: 'dark' })}
                        className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                          settings.theme === 'dark'
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-dark-600 bg-dark-700 hover:border-dark-500'
                        }`}
                      >
                        <HiMoon className="text-xl" />
                        <span className="text-white font-medium">Dark</span>
                      </button>
                      <button
                        onClick={() => setSettings({ ...settings, theme: 'light' })}
                        className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                          settings.theme === 'light'
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-dark-600 bg-dark-700 hover:border-dark-500'
                        }`}
                      >
                        <HiSun className="text-xl" />
                        <span className="text-white font-medium">Light</span>
                      </button>
                    </div>
                  </div>

                  {/* Default View */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Default View
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setSettings({ ...settings, defaultView: 'masonry' })}
                        className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                          settings.defaultView === 'masonry'
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-dark-600 bg-dark-700 hover:border-dark-500'
                        }`}
                      >
                        <HiViewGrid className="text-xl" />
                        <span className="text-white font-medium">Masonry</span>
                      </button>
                      <button
                        onClick={() => setSettings({ ...settings, defaultView: 'list' })}
                        className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                          settings.defaultView === 'list'
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-dark-600 bg-dark-700 hover:border-dark-500'
                        }`}
                      >
                        <HiViewGrid className="text-xl rotate-90" />
                        <span className="text-white font-medium">List</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Notifications</h3>
                <div className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-400">Receive updates via email</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      settings.emailNotifications ? 'bg-primary-600' : 'bg-dark-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Storage Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Storage</h3>
                <div className="p-4 bg-dark-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Used Storage</span>
                    <span className="text-white font-medium">Coming Soon</span>
                  </div>
                  <div className="w-full bg-dark-600 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between space-x-3">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 font-medium rounded-lg transition-all cursor-pointer"
                >
                  Reset to Defaults
                </button>
                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 hover:bg-dark-800 text-gray-300 font-medium rounded-lg transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default SettingsModal;
