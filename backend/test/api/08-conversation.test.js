import { expect, chai, tokens, testData, validateSuccessResponse, validateErrorResponse } from '../helpers.js';

const baseURL = global.testConfig.baseURL;
const apiPrefix = global.testConfig.apiPrefix;

describe('Conversation (Messaging) Endpoints', function() {
  this.timeout(global.testConfig.timeout);

  let testConversationId;
  let testListingId;
  let sellerId;

  before(async () => {
    // Get seller ID
    const sellerRes = await chai
      .request(baseURL)
      .post(`${apiPrefix}/users/signin`)
      .send({
        email: global.testAccounts.seller1.email,
        password: global.testAccounts.seller1.password
      });

    if (sellerRes.body.success) {
      sellerId = sellerRes.body.user.user_id;
    }

    // Get a listing
    const listingsRes = await chai
      .request(baseURL)
      .get(`${apiPrefix}/listings?limit=1`);

    if (listingsRes.body.success && listingsRes.body.listings.length > 0) {
      testListingId = listingsRes.body.listings[0].listing_id;
    }
  });

  describe('43. POST /conversations - Create or Get Conversation', () => {
    it('should create a new conversation', async () => {
      if (!testListingId || !sellerId) {
        this.skip();
        return;
      }

      const conversationData = {
        listing_id: testListingId,
        seller_id: sellerId,
        initial_message: 'Hello, I am interested in this item. Is it still available?'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/conversations`)
        .set('Authorization', `Bearer ${tokens.buyer1}`)
        .send(conversationData);

      validateSuccessResponse(res, 201);
      expect(res.body).to.have.property('conversation_id');
      expect(res.body).to.have.property('message');

      testConversationId = res.body.conversation_id;
      testData.conversationIds.test1 = testConversationId;
    });

    it('should get existing conversation instead of creating duplicate', async () => {
      if (!testListingId || !sellerId) {
        this.skip();
        return;
      }

      const conversationData = {
        listing_id: testListingId,
        seller_id: sellerId,
        initial_message: 'Follow up message'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/conversations`)
        .set('Authorization', `Bearer ${tokens.buyer1}`)
        .send(conversationData);

      // Should return 200 with existing conversation
      expect(res.status).to.be.oneOf([200, 201]);
      expect(res.body).to.have.property('conversation_id');
    });

    it('should reject conversation creation without authentication', async () => {
      if (!testListingId || !sellerId) {
        this.skip();
        return;
      }

      const conversationData = {
        listing_id: testListingId,
        seller_id: sellerId,
        initial_message: 'Unauthorized message'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/conversations`)
        .send(conversationData);

      validateErrorResponse(res, 401);
    });

    it('should reject conversation with missing required fields', async () => {
      const conversationData = {
        initial_message: 'Missing fields'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/conversations`)
        .set('Authorization', `Bearer ${tokens.buyer1}`)
        .send(conversationData);

      validateErrorResponse(res, 400);
    });
  });

  describe('44. GET /conversations - Get User Conversations', () => {
    it('should get user\'s conversations', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/conversations`)
        .set('Authorization', `Bearer ${tokens.buyer1}`);

      validateSuccessResponse(res, 200);
      expect(res.body).to.have.property('conversations');
      expect(res.body.conversations).to.be.an('array');
    });

    it('should paginate conversations', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/conversations?limit=10&offset=0`)
        .set('Authorization', `Bearer ${tokens.buyer1}`);

      validateSuccessResponse(res, 200);
      expect(res.body.conversations).to.be.an('array');
    });

    it('should reject getting conversations without authentication', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/conversations`);

      validateErrorResponse(res, 401);
    });

    it('should return empty array for user with no conversations', async () => {
      // Create a new user without conversations
      const newUserData = {
        email: `noconv_${Date.now()}@example.com`,
        password: 'password123',
        username: `noconv_${Date.now()}`,
        first_name: 'No',
        last_name: 'Conversation',
        role: 'buyer'
      };

      const signupRes = await chai
        .request(baseURL)
        .post(`${apiPrefix}/users/signup`)
        .send(newUserData);

      if (signupRes.body.success) {
        const signinRes = await chai
          .request(baseURL)
          .post(`${apiPrefix}/users/signin`)
          .send({
            email: newUserData.email,
            password: newUserData.password
          });

        if (signinRes.body.success) {
          const res = await chai
            .request(baseURL)
            .get(`${apiPrefix}/conversations`)
            .set('Authorization', `Bearer ${signinRes.body.token}`);

          validateSuccessResponse(res, 200);
          expect(res.body.conversations).to.be.an('array');
          expect(res.body.conversations).to.have.length(0);
        }
      }
    });
  });

  describe('45. GET /conversations/unread-count - Get Unread Message Count', () => {
    it('should get unread message count', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/conversations/unread-count`)
        .set('Authorization', `Bearer ${tokens.buyer1}`);

      validateSuccessResponse(res, 200);
      expect(res.body).to.have.property('unreadCount');
      expect(res.body.unreadCount).to.be.a('number');
      expect(res.body.unreadCount).to.be.at.least(0);
    });

    it('should reject getting unread count without authentication', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/conversations/unread-count`);

      validateErrorResponse(res, 401);
    });
  });

  describe('46. GET /conversations/:conversationId/messages - Get Conversation Messages', () => {
    it('should get messages from a conversation', async () => {
      if (!testConversationId) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/conversations/${testConversationId}/messages`)
        .set('Authorization', `Bearer ${tokens.buyer1}`);

      validateSuccessResponse(res, 200);
      expect(res.body).to.have.property('messages');
      expect(res.body.messages).to.be.an('array');
    });

    it('should paginate conversation messages', async () => {
      if (!testConversationId) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/conversations/${testConversationId}/messages?limit=50&offset=0`)
        .set('Authorization', `Bearer ${tokens.buyer1}`);

      validateSuccessResponse(res, 200);
      expect(res.body.messages).to.be.an('array');
    });

    it('should reject getting messages without authentication', async () => {
      if (!testConversationId) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/conversations/${testConversationId}/messages`);

      validateErrorResponse(res, 401);
    });

    it('should reject getting messages from conversation user is not part of', async () => {
      if (!testConversationId) {
        this.skip();
        return;
      }

      // Create a new user who is not part of the conversation
      const newUserData = {
        email: `outsider_${Date.now()}@example.com`,
        password: 'password123',
        username: `outsider_${Date.now()}`,
        first_name: 'Outsider',
        last_name: 'User',
        role: 'buyer'
      };

      const signupRes = await chai
        .request(baseURL)
        .post(`${apiPrefix}/users/signup`)
        .send(newUserData);

      if (signupRes.body.success) {
        const signinRes = await chai
          .request(baseURL)
          .post(`${apiPrefix}/users/signin`)
          .send({
            email: newUserData.email,
            password: newUserData.password
          });

        if (signinRes.body.success) {
          const res = await chai
            .request(baseURL)
            .get(`${apiPrefix}/conversations/${testConversationId}/messages`)
            .set('Authorization', `Bearer ${signinRes.body.token}`);

          validateErrorResponse(res, 403);
        }
      }
    });
  });

  describe('47. POST /conversations/:conversationId/messages - Send Message', () => {
    it('should send a message in a conversation', async () => {
      if (!testConversationId) {
        this.skip();
        return;
      }

      const messageData = {
        message_text: 'This is a test message from automated testing'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/conversations/${testConversationId}/messages`)
        .set('Authorization', `Bearer ${tokens.buyer1}`)
        .send(messageData);

      validateSuccessResponse(res, 201);
      expect(res.body).to.have.property('message_id');
    });

    it('should reject sending message without authentication', async () => {
      if (!testConversationId) {
        this.skip();
        return;
      }

      const messageData = {
        message_text: 'Unauthorized message'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/conversations/${testConversationId}/messages`)
        .send(messageData);

      validateErrorResponse(res, 401);
    });

    it('should reject sending empty message', async () => {
      if (!testConversationId) {
        this.skip();
        return;
      }

      const messageData = {
        message_text: ''
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/conversations/${testConversationId}/messages`)
        .set('Authorization', `Bearer ${tokens.buyer1}`)
        .send(messageData);

      validateErrorResponse(res, 400);
    });
  });

  describe('48. PATCH /conversations/:conversationId/read - Mark Messages as Read', () => {
    it('should mark messages as read', async () => {
      if (!testConversationId) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .patch(`${apiPrefix}/conversations/${testConversationId}/read`)
        .set('Authorization', `Bearer ${tokens.seller1}`);

      validateSuccessResponse(res, 200);
    });

    it('should reject marking messages as read without authentication', async () => {
      if (!testConversationId) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .patch(`${apiPrefix}/conversations/${testConversationId}/read`);

      validateErrorResponse(res, 401);
    });
  });

  describe('49. DELETE /conversations/:conversationId - Delete Conversation', () => {
    let conversationToDelete;

    before(async () => {
      // Create a conversation to delete
      if (testListingId && sellerId) {
        const conversationData = {
          listing_id: testListingId,
          seller_id: sellerId,
          initial_message: 'This conversation will be deleted'
        };

        const res = await chai
          .request(baseURL)
          .post(`${apiPrefix}/conversations`)
          .set('Authorization', `Bearer ${tokens.buyer1}`)
          .send(conversationData);

        if (res.body.success) {
          conversationToDelete = res.body.conversation_id;
        }
      }
    });

    it('should delete a conversation', async () => {
      if (!conversationToDelete) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .delete(`${apiPrefix}/conversations/${conversationToDelete}`)
        .set('Authorization', `Bearer ${tokens.buyer1}`);

      validateSuccessResponse(res, 200);
    });

    it('should reject deleting conversation without authentication', async () => {
      if (!testConversationId) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .delete(`${apiPrefix}/conversations/${testConversationId}`);

      validateErrorResponse(res, 401);
    });

    it('should return 404 for non-existent conversation', async () => {
      const res = await chai
        .request(baseURL)
        .delete(`${apiPrefix}/conversations/999999`)
        .set('Authorization', `Bearer ${tokens.buyer1}`);

      validateErrorResponse(res, 404);
    });
  });
});
