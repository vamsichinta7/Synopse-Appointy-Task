import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiHome,
  HiSearch,
  HiLightningBolt,
  HiArchive,
  HiCog,
  HiStar,
} from 'react-icons/hi';
import { FaBrain } from 'react-icons/fa';
import { useItemsStore } from '../store/itemsStore';
import SettingsModal from './SettingsModal';

const navigation = [
  { name: 'Dashboard', to: '/', icon: HiHome },
  { name: 'Search', to: '/search', icon: HiSearch },
  { name: 'Reflection', to: '/reflection', icon: HiLightningBolt },
];

function Sidebar({ onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { setFilters, filters } = useItemsStore();
  const [showSettings, setShowSettings] = useState(false);

  const handleArchiveClick = () => {
    setFilters({ archived: !filters.archived, favorite: false });
    if (location.pathname !== '/') {
      navigate('/');
    }
    if (onClose) onClose();
  };

  const handleStarredClick = () => {
    setFilters({ favorite: !filters.favorite, archived: false });
    if (location.pathname !== '/') {
      navigate('/');
    }
    if (onClose) onClose();
  };

  const handleNavClick = () => {
    // Reset filters when navigating to different pages
    setFilters({ archived: false, favorite: false });
    if (onClose) onClose();
  };

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      exit={{ x: -300 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-64 h-screen glass border-r border-dark-700 flex flex-col"
    >
      {/* Logo */}
      <div className="p-6 border-b border-dark-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
            <FaBrain className="text-2xl text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Synapse</h1>
            <p className="text-xs text-gray-400">Your Second Brain</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'text-gray-400 hover:bg-dark-700 hover:text-white'
              }`
            }
          >
            <item.icon className="text-xl" />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}

        <div className="pt-4 border-t border-dark-700 mt-4">
          <button
            onClick={handleStarredClick}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 w-full cursor-pointer ${
              filters.favorite
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                : 'text-gray-400 hover:bg-dark-700 hover:text-white'
            }`}
          >
            <HiStar className="text-xl" />
            <span className="font-medium">Starred</span>
          </button>
          <button
            onClick={handleArchiveClick}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 w-full cursor-pointer ${
              filters.archived
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                : 'text-gray-400 hover:bg-dark-700 hover:text-white'
            }`}
          >
            <HiArchive className="text-xl" />
            <span className="font-medium">Archived</span>
          </button>
        </div>
      </nav>

      {/* Settings */}
      <div className="p-4 border-t border-dark-700">
        <button
          onClick={() => setShowSettings(true)}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-dark-700 hover:text-white transition-all duration-200 w-full cursor-pointer"
        >
          <HiCog className="text-xl" />
          <span className="font-medium">Settings</span>
        </button>
      </div>

      {/* Settings Modal */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </motion.aside>
  );
}

export default Sidebar;
