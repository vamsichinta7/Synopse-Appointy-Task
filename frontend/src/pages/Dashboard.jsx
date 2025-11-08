import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Masonry from 'react-masonry-css';
import { HiFilter, HiViewGrid, HiViewList } from 'react-icons/hi';
import { useItemsStore } from '../store/itemsStore';
import ItemCard from '../components/cards/ItemCard';
import toast from 'react-hot-toast';

const categories = [
  { value: 'all', label: 'All' },
  { value: 'article', label: 'Articles' },
  { value: 'product', label: 'Products' },
  { value: 'todo', label: 'To-Do' },
  { value: 'video', label: 'Videos' },
  { value: 'book', label: 'Books' },
  { value: 'paper', label: 'Papers' },
  { value: 'idea', label: 'Ideas' },
  { value: 'note', label: 'Notes' },
  { value: 'others', label: 'Others' },
];

function Dashboard() {
  const { items, loading, fetchItems, filters, setFilters, deleteItem, updateItem } = useItemsStore();
  const [view, setView] = useState('masonry'); // masonry, grid, list

  useEffect(() => {
    fetchItems();
  }, [filters]);

  const handleDelete = async (id) => {
    try {
      await deleteItem(id);
      toast.success('Item deleted');
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      await updateItem(id, data);
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
          {filters.favorite ? 'Starred Items' : filters.archived ? 'Archived Items' : 'Your Brain'}
        </h1>
        <p className="text-gray-400">
          {items.length} {items.length === 1 ? 'item' : 'items'} {filters.favorite ? 'starred' : filters.archived ? 'archived' : 'saved'}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Category Filter */}
        <div className="w-full sm:w-auto overflow-x-auto pb-2">
          <div className="flex items-center space-x-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setFilters({ category: category.value })}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm sm:text-base cursor-pointer ${
                  filters.category === category.value
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setView('masonry')}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              view === 'masonry'
                ? 'bg-primary-600 text-white'
                : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
            }`}
            title="Masonry View"
          >
            <HiViewGrid className="text-xl" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              view === 'list'
                ? 'bg-primary-600 text-white'
                : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
            }`}
            title="List View"
          >
            <HiViewList className="text-xl" />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!loading && items.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="w-24 h-24 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiFilter className="text-4xl text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No items yet</h3>
          <p className="text-gray-400 mb-6">
            Start building your second brain by adding your first item
          </p>
        </motion.div>
      )}

      {/* Items Grid */}
      {!loading && items.length > 0 && (
        <Masonry
          breakpointCols={view === 'list' ? 1 : breakpointColumns}
          className="masonry-grid"
          columnClassName="masonry-grid_column"
        >
          {items.map((item) => (
            <ItemCard
              key={item._id}
              item={item}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        </Masonry>
      )}
    </div>
  );
}

export default Dashboard;
