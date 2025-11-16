import { expect, chai, tokens, loginUser, getBasicAuthHeader, validateSuccessResponse, validateErrorResponse } from '../helpers.js';

const baseURL = global.testConfig.baseURL;
const apiPrefix = global.testConfig.apiPrefix;

describe('User Endpoints', function() {
  this.timeout(global.testConfig.timeout);

  describe('1. GET /users - Health Check', () => {
    it('should return operational status', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/users`);

      validateSuccessResponse(res, 200);
      expect(res.body.message).to.equal('User router is operational');
    });
  });

  describe('2. POST /users/signup - User Signup', () => {
    it('should register a new buyer account successfully', async () => {
      const userData = {
        email: `testbuyer_${Date.now()}@example.com`,
        password: 'testpassword123',
        username: `testbuyer_${Date.now()}`,
        first_name: 'Test',
        last_name: 'Buyer',
        role: 'buyer'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/users/signup`)
        .send(userData);

      validateSuccessResponse(res, 201);
      expect(res.body).to.have.property('id');
      expect(res.body.id).to.be.a('number');
    });

    it('should register a new seller account successfully', async () => {
      const userData = {
        email: `testseller_${Date.now()}@example.com`,
        password: 'testpassword123',
        username: `testseller_${Date.now()}`,
        first_name: 'Test',
        last_name: 'Seller',
        role: 'seller'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/users/signup`)
        .send(userData);

      validateSuccessResponse(res, 201);
      expect(res.body).to.have.property('id');
    });

    it('should reject registration with admin role', async () => {
      const userData = {
        email: `testadmin_${Date.now()}@example.com`,
        password: 'testpassword123',
        username: `testadmin_${Date.now()}`,
        first_name: 'Test',
        last_name: 'Admin',
        role: 'admin'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/users/signup`)
        .send(userData);

      validateErrorResponse(res, 400);
    });

    it('should reject registration with missing fields', async () => {
      const userData = {
        email: `incomplete_${Date.now()}@example.com`,
        password: 'testpassword123'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/users/signup`)
        .send(userData);

      validateErrorResponse(res, 400);
    });
  });

  describe('3. POST /users/signin - User Sign In', () => {
    it('should login with valid seller credentials', async () => {
      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/users/signin`)
        .send({
          email: global.testAccounts.seller1.email,
          password: global.testAccounts.seller1.password
        });

      validateSuccessResponse(res, 200);
      expect(res.body).to.have.property('token');
      expect(res.body).to.have.property('user');
      expect(res.body.user).to.have.property('user_role').that.equals('seller');

      // Store token for later tests
      tokens.seller1 = res.body.token;
    });

    it('should login with valid buyer credentials', async () => {
      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/users/signin`)
        .send({
          email: global.testAccounts.buyer1.email,
          password: global.testAccounts.buyer1.password
        });

      validateSuccessResponse(res, 200);
      expect(res.body).to.have.property('token');
      expect(res.body.user).to.have.property('user_role').that.equals('buyer');

      tokens.buyer1 = res.body.token;
    });

    it('should login with valid admin credentials', async () => {
      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/users/signin`)
        .send({
          email: global.testAccounts.admin.email,
          password: global.testAccounts.admin.password
        });

      validateSuccessResponse(res, 200);
      expect(res.body).to.have.property('token');
      expect(res.body.user).to.have.property('user_role').that.equals('admin');

      tokens.admin = res.body.token;
    });

    it('should reject login with invalid credentials', async () => {
      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/users/signin`)
        .send({
          email: 'invalid@example.com',
          password: 'wrongpassword'
        });

      validateErrorResponse(res, 401);
    });
  });

  describe('4. GET /users/verify-token - Verify Token', () => {
    it('should verify valid token', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/users/verify-token`)
        .set('Authorization', `Bearer ${tokens.seller1}`);

      validateSuccessResponse(res, 200);
      expect(res.body).to.have.property('userId');
    });

    it('should reject invalid token', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/users/verify-token`)
        .set('Authorization', 'Bearer invalid_token_here');

      validateErrorResponse(res, 401);
    });

    it('should reject missing token', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/users/verify-token`);

      validateErrorResponse(res, 401);
    });
  });

  describe('5. PATCH /users/edit-profile - Edit User Profile', () => {
    it('should update user profile successfully', async () => {
      const updateData = {
        first_name: 'Updated',
        last_name: 'Name'
      };

      const res = await chai
        .request(baseURL)
        .patch(`${apiPrefix}/users/edit-profile`)
        .set('Authorization', `Bearer ${tokens.seller1}`)
        .send(updateData);

      validateSuccessResponse(res, 200);
      expect(res.body).to.have.property('user');
      expect(res.body.user.first_name).to.equal('Updated');
      expect(res.body.user.last_name).to.equal('Name');
    });

    it('should reject profile update without authentication', async () => {
      const updateData = {
        first_name: 'Updated'
      };

      const res = await chai
        .request(baseURL)
        .patch(`${apiPrefix}/users/edit-profile`)
        .send(updateData);

      validateErrorResponse(res, 401);
    });
  });

  describe('6. POST /users/change-password - Change Password', () => {
    it('should reject password change with wrong current password', async () => {
      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/users/change-password`)
        .set('Authorization', `Bearer ${tokens.seller1}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123'
        });

      validateErrorResponse(res, 400);
    });

    it('should reject password change without authentication', async () => {
      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/users/change-password`)
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword123'
        });

      validateErrorResponse(res, 401);
    });
  });

  describe('7. POST /users/super-signup - Create Admin Account', () => {
    it('should create admin account with super admin credentials', async () => {
      const adminData = {
        email: `newadmin_${Date.now()}@marketplace.com`,
        password: 'adminpassword123',
        username: `newadmin_${Date.now()}`,
        first_name: 'New',
        last_name: 'Admin'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/users/super-signup`)
        .auth(global.testAccounts.superAdmin.email, global.testAccounts.superAdmin.password)
        .send(adminData);

      validateSuccessResponse(res, 201);
      expect(res.body).to.have.property('id');
    });

    it('should reject admin creation without super admin auth', async () => {
      const adminData = {
        email: `newadmin2_${Date.now()}@marketplace.com`,
        password: 'adminpassword123',
        username: `newadmin2_${Date.now()}`,
        first_name: 'New',
        last_name: 'Admin'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/users/super-signup`)
        .send(adminData);

      validateErrorResponse(res, 401);
    });
  });

  describe('8. DELETE /users/delete-user - Delete User', () => {
    let userIdToDelete;

    before(async () => {
      // Create a user to delete
      const userData = {
        email: `todelete_${Date.now()}@example.com`,
        password: 'password123',
        username: `todelete_${Date.now()}`,
        first_name: 'To',
        last_name: 'Delete',
        role: 'buyer'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/users/signup`)
        .send(userData);

      userIdToDelete = res.body.id;
    });

    it('should delete user with super admin credentials', async () => {
      const res = await chai
        .request(baseURL)
        .delete(`${apiPrefix}/users/delete-user`)
        .auth(global.testAccounts.superAdmin.email, global.testAccounts.superAdmin.password)
        .send({ user_id: userIdToDelete });

      validateSuccessResponse(res, 200);
      expect(res.body).to.have.property('deletedUser');
    });

    it('should reject user deletion without super admin auth', async () => {
      const res = await chai
        .request(baseURL)
        .delete(`${apiPrefix}/users/delete-user`)
        .send({ user_id: 999999 });

      validateErrorResponse(res, 401);
    });
  });
});
