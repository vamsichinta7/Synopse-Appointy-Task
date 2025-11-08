import { create } from 'zustand';
import api from '../utils/api';

export const useItemsStore = create((set, get) => ({
  items: [],
  loading: false,
  error: null,
  filters: {
    category: 'all',
    tags: [],
    search: '',
    archived: false,
    favorite: false,
  },
  pagination: {
    page: 1,
    limit: 50,
    total: 0,
    pages: 1,
  },

  fetchItems: async () => {
    set({ loading: true, error: null });

    try {
      const { filters, pagination } = get();
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
        tags: filters.tags.join(','),
      };

      const response = await api.get('/items', { params });

      set({
        items: response.data.items,
        pagination: response.data.pagination,
        loading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to fetch items',
        loading: false,
      });
    }
  },

  createItem: async (data) => {
    try {
      const response = await api.post('/items', data);
      const newItem = response.data.item;

      set((state) => ({
        items: [newItem, ...state.items],
      }));

      return newItem;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to create item');
    }
  },

  updateItem: async (id, data) => {
    try {
      const response = await api.put(`/items/${id}`, data);
      const updatedItem = response.data.item;

      set((state) => ({
        items: state.items.map((item) =>
          item._id === id ? updatedItem : item
        ),
      }));

      return updatedItem;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update item');
    }
  },

  deleteItem: async (id) => {
    try {
      await api.delete(`/items/${id}`);

      set((state) => ({
        items: state.items.filter((item) => item._id !== id),
      }));
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to delete item');
    }
  },

  uploadFile: async (file, caption = '', tags = [], category = undefined) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (caption) {
        formData.append('caption', caption);
      }
      if (tags && tags.length > 0) {
        formData.append('tags', JSON.stringify(tags));
      }
      if (category) {
        formData.append('category', category);
      }

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newItem = response.data.item;

      set((state) => ({
        items: [newItem, ...state.items],
      }));

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to upload file');
    }
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
      pagination: { ...state.pagination, page: 1 },
    }));
  },

  setPage: (page) => {
    set((state) => ({
      pagination: { ...state.pagination, page },
    }));
  },

  clearFilters: () => {
    set({
      filters: {
        category: 'all',
        tags: [],
        search: '',
        archived: false,
        favorite: false,
      },
      pagination: {
        page: 1,
        limit: 50,
        total: 0,
        pages: 1,
      },
    });
  },
}));
