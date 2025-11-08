import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPlus, HiLogout, HiUser, HiMenu } from 'react-icons/hi';
import { useAuthStore } from '../store/authStore';
import AddItemModal from './AddItemModal';

function Header({ onMenuClick }) {
  const { user, logout } = useAuthStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <>
      <header className="glass border-b border-dark-700 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Hamburger menu for mobile */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors cursor-pointer"
            >
              <HiMenu className="text-2xl" />
            </button>

            <h2 className="text-lg sm:text-2xl font-bold text-white truncate">
              Welcome back, {user?.username}!
            </h2>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Add Item Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-2 sm:py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 cursor-pointer"
            >
              <HiPlus className="text-lg sm:text-xl" />
              <span className="hidden sm:inline">Add to Brain</span>
              <span className="sm:hidden text-sm">Add</span>
            </motion.button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-2 sm:px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                  <HiUser className="text-white" />
                </div>
                <span className="hidden sm:inline text-white font-medium">{user?.username}</span>
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-48 glass rounded-lg shadow-xl border border-dark-600 overflow-hidden z-50"
                  >
                    <div className="p-3 border-b border-dark-600">
                      <p className="text-sm text-gray-400">{user?.email}</p>
                    </div>
                    <button
                      onClick={logout}
                      className="flex items-center space-x-2 w-full px-4 py-3 text-left text-red-400 hover:bg-dark-700 transition-colors"
                    >
                      <HiLogout />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Add Item Modal */}
      <AddItemModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
    </>
  );
}

export default Header;
