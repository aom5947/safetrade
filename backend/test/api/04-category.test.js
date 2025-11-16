import { expect, chai, tokens, testData, validateSuccessResponse, validateErrorResponse, validatePagination } from '../helpers.js';

const baseURL = global.testConfig.baseURL;
const apiPrefix = global.testConfig.apiPrefix;

describe('Category Endpoints', function() {
  this.timeout(global.testConfig.timeout);

  let testCategoryId;
  let testCategorySlug;

  describe('22. GET /categories - Get All Categories', () => {
    it('should get all categories', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/categories`);

      validateSuccessResponse(res, 200);
      expect(res.body).to.have.property('categories');
      expect(res.body.categories).to.be.an('array');
    });

    it('should return categories with proper structure', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/categories`);

      validateSuccessResponse(res, 200);
      if (res.body.categories.length > 0) {
        const category = res.body.categories[0];
        expect(category).to.have.property('category_id');
        expect(category).to.have.property('category_name');
        expect(category).to.have.property('slug');
      }
    });
  });

  describe('23. GET /categories/:slug - Get Category by Slug', () => {
    before(async () => {
      // Get a category slug from the list
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/categories`);

      if (res.body.success && res.body.categories.length > 0) {
        testCategorySlug = res.body.categories[0].slug;
        testCategoryId = res.body.categories[0].category_id;
      }
    });

    it('should get category by slug', async () => {
      if (!testCategorySlug) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/categories/${testCategorySlug}`);

      validateSuccessResponse(res, 200);
      expect(res.body).to.have.property('category');
      expect(res.body.category).to.have.property('slug').that.equals(testCategorySlug);
    });

    it('should return 404 for non-existent slug', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/categories/non-existent-slug-12345`);

      validateErrorResponse(res, 404);
    });
  });

  describe('24. GET /categories/:slug/listings - Get Listings by Category', () => {
    it('should get listings for a category', async () => {
      if (!testCategorySlug) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/categories/${testCategorySlug}/listings`);

      validateSuccessResponse(res, 200);
      expect(res.body).to.have.property('listings');
      expect(res.body.listings).to.be.an('array');
      expect(res.body).to.have.property('pagination');
    });

    it('should filter category listings with pagination', async () => {
      if (!testCategorySlug) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/categories/${testCategorySlug}/listings?page=1&limit=10`);

      validateSuccessResponse(res, 200);
      expect(res.body.listings).to.be.an('array');
    });

    it('should sort category listings', async () => {
      if (!testCategorySlug) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/categories/${testCategorySlug}/listings?sort=price_low`);

      validateSuccessResponse(res, 200);
      expect(res.body.listings).to.be.an('array');
    });
  });

  describe('25. POST /categories/admin/create - Create Category', () => {
    it('should create a new category as admin', async () => {
      const categoryData = {
        category_name: `Test Category ${Date.now()}`,
        slug: `test-category-${Date.now()}`,
        description: 'A test category for automated testing',
        icon_url: 'https://example.com/icon.png'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/categories/admin/create`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send(categoryData);

      validateSuccessResponse(res, 201);
      expect(res.body).to.have.property('category_id');

      testData.categoryIds.test1 = res.body.category_id;
    });

    it('should reject category creation without authentication', async () => {
      const categoryData = {
        category_name: 'Unauthorized Category',
        slug: 'unauthorized-category',
        description: 'Should not be created'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/categories/admin/create`)
        .send(categoryData);

      validateErrorResponse(res, 401);
    });

    it('should reject category creation by non-admin', async () => {
      const categoryData = {
        category_name: 'Seller Category',
        slug: 'seller-category',
        description: 'Created by seller'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/categories/admin/create`)
        .set('Authorization', `Bearer ${tokens.seller1}`)
        .send(categoryData);

      validateErrorResponse(res, 403);
    });

    it('should reject category with missing required fields', async () => {
      const categoryData = {
        category_name: 'Incomplete Category'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/categories/admin/create`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send(categoryData);

      validateErrorResponse(res, 400);
    });
  });

  describe('26. PUT /categories/admin/:id - Update Category', () => {
    it('should update category as admin', async () => {
      if (!testData.categoryIds.test1) {
        this.skip();
        return;
      }

      const updateData = {
        category_name: `Updated Category ${Date.now()}`,
        description: 'Updated description for testing'
      };

      const res = await chai
        .request(baseURL)
        .put(`${apiPrefix}/categories/admin/${testData.categoryIds.test1}`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send(updateData);

      validateSuccessResponse(res, 200);
      expect(res.body).to.have.property('category');
    });

    it('should reject category update without authentication', async () => {
      if (!testData.categoryIds.test1) {
        this.skip();
        return;
      }

      const updateData = {
        category_name: 'Unauthorized Update'
      };

      const res = await chai
        .request(baseURL)
        .put(`${apiPrefix}/categories/admin/${testData.categoryIds.test1}`)
        .send(updateData);

      validateErrorResponse(res, 401);
    });

    it('should reject category update by non-admin', async () => {
      if (!testData.categoryIds.test1) {
        this.skip();
        return;
      }

      const updateData = {
        category_name: 'Seller Update'
      };

      const res = await chai
        .request(baseURL)
        .put(`${apiPrefix}/categories/admin/${testData.categoryIds.test1}`)
        .set('Authorization', `Bearer ${tokens.seller1}`)
        .send(updateData);

      validateErrorResponse(res, 403);
    });
  });

  describe('27. DELETE /categories/admin/:id - Delete Category', () => {
    let categoryToDelete;

    before(async () => {
      // Create a category to delete
      const categoryData = {
        category_name: `To Delete ${Date.now()}`,
        slug: `to-delete-${Date.now()}`,
        description: 'This category will be deleted'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/categories/admin/create`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send(categoryData);

      if (res.body.success) {
        categoryToDelete = res.body.category_id;
      }
    });

    it('should delete category as admin', async () => {
      if (!categoryToDelete) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .delete(`${apiPrefix}/categories/admin/${categoryToDelete}`)
        .set('Authorization', `Bearer ${tokens.admin}`);

      validateSuccessResponse(res, 200);
    });

    it('should reject category deletion without authentication', async () => {
      const res = await chai
        .request(baseURL)
        .delete(`${apiPrefix}/categories/admin/999`);

      validateErrorResponse(res, 401);
    });

    it('should reject category deletion by non-admin', async () => {
      const res = await chai
        .request(baseURL)
        .delete(`${apiPrefix}/categories/admin/999`)
        .set('Authorization', `Bearer ${tokens.buyer1}`);

      validateErrorResponse(res, 403);
    });
  });
});
