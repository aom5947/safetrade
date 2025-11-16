import { expect, chai, tokens, testData, validateSuccessResponse, validateErrorResponse } from '../helpers.js';

const baseURL = global.testConfig.baseURL;
const apiPrefix = global.testConfig.apiPrefix;

describe('Review Endpoints', function() {
  this.timeout(global.testConfig.timeout);

  let testReviewId;
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

    // Try to get an existing listing
    const listingsRes = await chai
      .request(baseURL)
      .get(`${apiPrefix}/listings?limit=1`);

    if (listingsRes.body.success && listingsRes.body.listings.length > 0) {
      testListingId = listingsRes.body.listings[0].listing_id;
    }
  });

  describe('27. GET /reviews/seller/:sellerId - Get Seller Reviews', () => {
    it('should get reviews for a seller', async () => {
      if (!sellerId) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/reviews/seller/${sellerId}`);

      validateSuccessResponse(res, 200);
      expect(res.body).to.have.property('reviews');
      expect(res.body.reviews).to.be.an('array');
    });

    it('should paginate seller reviews', async () => {
      if (!sellerId) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/reviews/seller/${sellerId}?limit=5&offset=0`);

      validateSuccessResponse(res, 200);
      expect(res.body.reviews).to.be.an('array');
    });

    it('should return empty array for seller with no reviews', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/reviews/seller/999999`);

      validateSuccessResponse(res, 200);
      expect(res.body.reviews).to.be.an('array');
      expect(res.body.reviews).to.have.length(0);
    });
  });

  describe('28. GET /reviews/listing/:listingId - Get Listing Reviews', () => {
    it('should get reviews for a listing', async () => {
      if (!testListingId) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/reviews/listing/${testListingId}`);

      validateSuccessResponse(res, 200);
      expect(res.body).to.have.property('reviews');
      expect(res.body.reviews).to.be.an('array');
    });

    it('should paginate listing reviews', async () => {
      if (!testListingId) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/reviews/listing/${testListingId}?limit=10&offset=0`);

      validateSuccessResponse(res, 200);
      expect(res.body.reviews).to.be.an('array');
    });

    it('should return empty array for listing with no reviews', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/reviews/listing/999999`);

      validateSuccessResponse(res, 200);
      expect(res.body.reviews).to.be.an('array');
      expect(res.body.reviews).to.have.length(0);
    });
  });

  describe('29. POST /reviews - Create Review', () => {
    it('should create a review for a listing', async () => {
      if (!testListingId) {
        this.skip();
        return;
      }

      const reviewData = {
        listingId: testListingId,
        rating: 5,
        comment: 'Excellent product! Highly recommended.'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/reviews`)
        .set('Authorization', `Bearer ${tokens.buyer1}`)
        .send(reviewData);

      if (res.status === 201) {
        validateSuccessResponse(res, 201);
        expect(res.body).to.have.property('data');
        expect(res.body.data).to.have.property('reviewId');
        testReviewId = res.body.data.reviewId;
        testData.reviewIds.test1 = testReviewId;
      } else {
        // Might fail if already reviewed
        expect(res.status).to.be.oneOf([201, 400]);
      }
    });

    it('should reject review creation without authentication', async () => {
      if (!testListingId) {
        this.skip();
        return;
      }

      const reviewData = {
        listingId: testListingId,
        rating: 5,
        comment: 'Unauthorized review'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/reviews`)
        .send(reviewData);

      validateErrorResponse(res, 401);
    });

    it('should reject review with invalid rating', async () => {
      if (!testListingId) {
        this.skip();
        return;
      }

      const reviewData = {
        listingId: testListingId,
        rating: 6, // Invalid rating (should be 1-5)
        comment: 'Invalid rating test'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/reviews`)
        .set('Authorization', `Bearer ${tokens.buyer1}`)
        .send(reviewData);

      validateErrorResponse(res, 400);
    });

    it('should reject review with missing required fields', async () => {
      const reviewData = {
        rating: 5
        // Missing listing_id
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/reviews`)
        .set('Authorization', `Bearer ${tokens.buyer1}`)
        .send(reviewData);

      validateErrorResponse(res, 400);
    });
  });

  describe('30. GET /reviews/check/:listingId - Check If User Reviewed', () => {
    it('should check if user has reviewed a listing', async () => {
      if (!testListingId) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/reviews/check/${testListingId}`)
        .set('Authorization', `Bearer ${tokens.buyer1}`);

      validateSuccessResponse(res, 200);
      expect(res.body).to.have.property('hasReviewed');
      expect(res.body.hasReviewed).to.be.a('boolean');
    });

    it('should reject check without authentication', async () => {
      if (!testListingId) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/reviews/check/${testListingId}`);

      validateErrorResponse(res, 401);
    });
  });

  describe('31. DELETE /reviews/:reviewId - Delete Review', () => {
    let reviewToDelete;

    before(async () => {
      // Create a review to delete
      if (testListingId) {
        const reviewData = {
          listingId: testListingId,
          rating: 4,
          comment: 'This review will be deleted for testing purposes'
        };

        const res = await chai
          .request(baseURL)
          .post(`${apiPrefix}/reviews`)
          .set('Authorization', `Bearer ${tokens.buyer1}`)
          .send(reviewData);

        if (res.body.success && res.body.data) {
          reviewToDelete = res.body.data.reviewId;
        }
      }
    });

    it('should delete own review', async () => {
      if (!reviewToDelete) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .delete(`${apiPrefix}/reviews/${reviewToDelete}`)
        .set('Authorization', `Bearer ${tokens.buyer1}`);

      validateSuccessResponse(res, 200);
    });

    it('should reject review deletion without authentication', async () => {
      const res = await chai
        .request(baseURL)
        .delete(`${apiPrefix}/reviews/999`);

      validateErrorResponse(res, 401);
    });

    it('should return 404 for non-existent review', async () => {
      const res = await chai
        .request(baseURL)
        .delete(`${apiPrefix}/reviews/999999`)
        .set('Authorization', `Bearer ${tokens.buyer1}`);

      validateErrorResponse(res, 404);
    });
  });

  describe('32. PATCH /reviews/:reviewId/spam - Mark Review as Spam', () => {
    it('should mark review as spam by admin', async () => {
      if (!testReviewId) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .patch(`${apiPrefix}/reviews/${testReviewId}/spam`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({ isSpam: true });

      validateSuccessResponse(res, 200);
    });

    it('should reject spam marking without authentication', async () => {
      if (!testReviewId) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .patch(`${apiPrefix}/reviews/${testReviewId}/spam`)
        .send({ is_spam: true });

      validateErrorResponse(res, 401);
    });

    it('should reject spam marking by non-admin', async () => {
      if (!testReviewId) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .patch(`${apiPrefix}/reviews/${testReviewId}/spam`)
        .set('Authorization', `Bearer ${tokens.buyer1}`)
        .send({ isSpam: true });

      validateErrorResponse(res, 403);
    });

    it('should unmark review as spam', async () => {
      if (!testReviewId) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .patch(`${apiPrefix}/reviews/${testReviewId}/spam`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({ isSpam: false });

      validateSuccessResponse(res, 200);
    });
  });
});
