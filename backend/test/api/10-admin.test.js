import { expect, chai, tokens, validateSuccessResponse, validateErrorResponse } from '../helpers.js';

const baseURL = global.testConfig.baseURL;
const apiPrefix = global.testConfig.apiPrefix;

describe('Admin Endpoints', function() {
  this.timeout(global.testConfig.timeout);

  let testUserId;
  let testListingId;
  let testCategoryId;

  before(async () => {
    // Get an existing listing
    const listingsRes = await chai
      .request(baseURL)
      .get(`${apiPrefix}/listings?limit=1`);

    if (listingsRes.body.success && listingsRes.body.listings.length > 0) {
      testListingId = listingsRes.body.listings[0].listing_id;
    }

    // Get an existing category
    const categoriesRes = await chai
      .request(baseURL)
      .get(`${apiPrefix}/categories`);

    if (categoriesRes.body.success && categoriesRes.body.categories.length > 0) {
      testCategoryId = categoriesRes.body.categories[0].category_id;
    }
  });

  describe('53. POST /admin/users - Create Admin Account', () => {
    it('should create admin account with super admin credentials', async () => {
      const adminData = {
        email: `admin_test_${Date.now()}@marketplace.com`,
        password: 'adminpassword123',
        username: `admin_test_${Date.now()}`,
        first_name: 'Admin',
        last_name: 'Test'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/admin/users`)
        .auth(global.testAccounts.superAdmin.email, global.testAccounts.superAdmin.password)
        .send(adminData);

      validateSuccessResponse(res, 201);
      expect(res.body).to.have.property('id');
    });

    it('should reject admin creation without super admin auth', async () => {
      const adminData = {
        email: `admin_noauth_${Date.now()}@marketplace.com`,
        password: 'adminpassword123',
        username: `admin_noauth_${Date.now()}`,
        first_name: 'No',
        last_name: 'Auth'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/admin/users`)
        .send(adminData);

      validateErrorResponse(res, 401);
    });

    it('should reject admin creation with JWT token (must use Basic Auth)', async () => {
      const adminData = {
        email: `admin_jwt_${Date.now()}@marketplace.com`,
        password: 'adminpassword123',
        username: `admin_jwt_${Date.now()}`,
        first_name: 'JWT',
        last_name: 'Test'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/admin/users`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send(adminData);

      validateErrorResponse(res, 401);
    });

    it('should reject admin creation with missing required fields', async () => {
      const adminData = {
        email: `incomplete_${Date.now()}@marketplace.com`
        // Missing password, username, first_name, last_name
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/admin/users`)
        .auth(global.testAccounts.superAdmin.email, global.testAccounts.superAdmin.password)
        .send(adminData);

      validateErrorResponse(res, 400);
    });
  });

  describe('54. DELETE /admin/users/:id - Delete User Account', () => {
    before(async () => {
      // Create a user to delete
      const userData = {
        email: `todelete_admin_${Date.now()}@example.com`,
        password: 'password123',
        username: `todelete_admin_${Date.now()}`,
        first_name: 'To',
        last_name: 'Delete',
        role: 'buyer'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/users/signup`)
        .send(userData);

      if (res.body.success) {
        testUserId = res.body.id;
      }
    });

    it('should delete user with super admin credentials', async () => {
      if (!testUserId) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .delete(`${apiPrefix}/admin/users/${testUserId}`)
        .auth(global.testAccounts.superAdmin.email, global.testAccounts.superAdmin.password);

      validateSuccessResponse(res, 200);
      expect(res.body).to.have.property('deletedUser');
    });

    it('should reject user deletion without super admin auth', async () => {
      const res = await chai
        .request(baseURL)
        .delete(`${apiPrefix}/admin/users/999`);

      validateErrorResponse(res, 401);
    });

    it('should return 404 for non-existent user', async () => {
      const res = await chai
        .request(baseURL)
        .delete(`${apiPrefix}/admin/users/999999`)
        .auth(global.testAccounts.superAdmin.email, global.testAccounts.superAdmin.password);

      validateErrorResponse(res, 404);
    });
  });

  describe('55. POST /admin/categories - Create Category', () => {
    it('should create category as admin', async () => {
      const categoryData = {
        category_name: `Admin Category ${Date.now()}`,
        slug: `admin-category-${Date.now()}`,
        description: 'Category created by admin endpoint',
        icon_url: 'https://example.com/icon.png'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/admin/categories`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send(categoryData);

      validateSuccessResponse(res, 201);
      expect(res.body).to.have.property('category_id');
    });

    it('should reject category creation without authentication', async () => {
      const categoryData = {
        category_name: 'No Auth Category',
        slug: 'no-auth-category',
        description: 'Should fail'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/admin/categories`)
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
        .post(`${apiPrefix}/admin/categories`)
        .set('Authorization', `Bearer ${tokens.seller1}`)
        .send(categoryData);

      validateErrorResponse(res, 403);
    });
  });

  describe('56. PUT /admin/categories/:id - Update Category', () => {
    it('should update category as admin', async () => {
      if (!testCategoryId) {
        this.skip();
        return;
      }

      const updateData = {
        description: `Updated description ${Date.now()}`
      };

      const res = await chai
        .request(baseURL)
        .put(`${apiPrefix}/admin/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send(updateData);

      validateSuccessResponse(res, 200);
      expect(res.body).to.have.property('category');
    });

    it('should reject category update without authentication', async () => {
      if (!testCategoryId) {
        this.skip();
        return;
      }

      const updateData = {
        description: 'Unauthorized update'
      };

      const res = await chai
        .request(baseURL)
        .put(`${apiPrefix}/admin/categories/${testCategoryId}`)
        .send(updateData);

      validateErrorResponse(res, 401);
    });

    it('should reject category update by non-admin', async () => {
      if (!testCategoryId) {
        this.skip();
        return;
      }

      const updateData = {
        description: 'Buyer update'
      };

      const res = await chai
        .request(baseURL)
        .put(`${apiPrefix}/admin/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${tokens.buyer1}`)
        .send(updateData);

      validateErrorResponse(res, 403);
    });
  });

  describe('57. DELETE /admin/categories/:id - Delete Category', () => {
    let categoryToDelete;

    before(async () => {
      // Create a category to delete
      const categoryData = {
        category_name: `To Delete ${Date.now()}`,
        slug: `to-delete-${Date.now()}`,
        description: 'Will be deleted'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/admin/categories`)
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
        .delete(`${apiPrefix}/admin/categories/${categoryToDelete}`)
        .set('Authorization', `Bearer ${tokens.admin}`);

      validateSuccessResponse(res, 200);
    });

    it('should reject category deletion without authentication', async () => {
      const res = await chai
        .request(baseURL)
        .delete(`${apiPrefix}/admin/categories/999`);

      validateErrorResponse(res, 401);
    });

    it('should reject category deletion by non-admin', async () => {
      const res = await chai
        .request(baseURL)
        .delete(`${apiPrefix}/admin/categories/999`)
        .set('Authorization', `Bearer ${tokens.seller1}`);

      validateErrorResponse(res, 403);
    });
  });

  describe('58. PUT /admin/users/:id - Edit User Profile', () => {
    let userToEdit;

    before(async () => {
      // Create a user to edit
      const userData = {
        email: `toedit_${Date.now()}@example.com`,
        password: 'password123',
        username: `toedit_${Date.now()}`,
        first_name: 'To',
        last_name: 'Edit',
        role: 'buyer'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/users/signup`)
        .send(userData);

      if (res.body.success) {
        userToEdit = res.body.id;
      }
    });

    it('should edit user profile as admin', async () => {
      if (!userToEdit) {
        this.skip();
        return;
      }

      const updateData = {
        first_name: 'Edited',
        last_name: 'ByAdmin',
        status: 'active'
      };

      const res = await chai
        .request(baseURL)
        .put(`${apiPrefix}/admin/users/${userToEdit}`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send(updateData);

      validateSuccessResponse(res, 200);
      expect(res.body).to.have.property('user');
    });

    it('should reject user edit without authentication', async () => {
      if (!userToEdit) {
        this.skip();
        return;
      }

      const updateData = {
        first_name: 'Unauthorized'
      };

      const res = await chai
        .request(baseURL)
        .put(`${apiPrefix}/admin/users/${userToEdit}`)
        .send(updateData);

      validateErrorResponse(res, 401);
    });

    it('should reject user edit by non-admin', async () => {
      if (!userToEdit) {
        this.skip();
        return;
      }

      const updateData = {
        first_name: 'Seller Edit'
      };

      const res = await chai
        .request(baseURL)
        .put(`${apiPrefix}/admin/users/${userToEdit}`)
        .set('Authorization', `Bearer ${tokens.seller1}`)
        .send(updateData);

      validateErrorResponse(res, 403);
    });

    it('should return 404 for non-existent user', async () => {
      const updateData = {
        first_name: 'Not Found'
      };

      const res = await chai
        .request(baseURL)
        .put(`${apiPrefix}/admin/users/999999`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send(updateData);

      validateErrorResponse(res, 404);
    });
  });

  describe('59. PUT /admin/listings/:id - Edit Listing', () => {
    it('should edit listing as admin', async () => {
      if (!testListingId) {
        this.skip();
        return;
      }

      const updateData = {
        title: `Admin Edited ${Date.now()}`,
        description: 'Edited by admin for testing'
      };

      const res = await chai
        .request(baseURL)
        .put(`${apiPrefix}/admin/listings/${testListingId}`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send(updateData);

      validateSuccessResponse(res, 200);
      expect(res.body).to.have.property('listing');
    });

    it('should reject listing edit without authentication', async () => {
      if (!testListingId) {
        this.skip();
        return;
      }

      const updateData = {
        title: 'No Auth Edit'
      };

      const res = await chai
        .request(baseURL)
        .put(`${apiPrefix}/admin/listings/${testListingId}`)
        .send(updateData);

      validateErrorResponse(res, 401);
    });

    it('should reject listing edit by non-admin', async () => {
      if (!testListingId) {
        this.skip();
        return;
      }

      const updateData = {
        title: 'Buyer Edit'
      };

      const res = await chai
        .request(baseURL)
        .put(`${apiPrefix}/admin/listings/${testListingId}`)
        .set('Authorization', `Bearer ${tokens.buyer1}`)
        .send(updateData);

      validateErrorResponse(res, 403);
    });

    it('should return 404 for non-existent listing', async () => {
      const updateData = {
        title: 'Not Found'
      };

      const res = await chai
        .request(baseURL)
        .put(`${apiPrefix}/admin/listings/999999`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send(updateData);

      validateErrorResponse(res, 404);
    });
  });
});
