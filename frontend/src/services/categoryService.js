import apiClient from './api';

const categoryService = {
  // Get all categories
  getAllCategories: async () => {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  // Get category by ID
  getCategoryById: async (categoryId) => {
    const response = await apiClient.get(`/categories/${categoryId}`);
    return response.data;
  },

  // Create category (admin)
  createCategory: async (data) => {
    const response = await apiClient.post('/categories/admin/create', data);
    return response.data;
  },

  // Update category (admin)
  updateCategory: async (categoryId, data) => {
    const response = await apiClient.put(`/categories/admin/${categoryId}`, data);
    return response.data;
  },

  // Delete category (admin)
  deleteCategory: async (categoryId) => {
    const response = await apiClient.delete(`/categories/admin/${categoryId}`);
    return response.data;
  },
};

export default categoryService;
