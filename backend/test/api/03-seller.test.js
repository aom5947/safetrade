import { expect, chai, tokens, validateSuccessResponse, validateErrorResponse, validatePagination } from '../helpers.js';

const baseURL = global.testConfig.baseURL;
const apiPrefix = global.testConfig.apiPrefix;

describe('Seller Endpoints', function() {
  this.timeout(global.testConfig.timeout);

  let sellerId;

  before(async () => {
    // Get seller ID by signing in
    const res = await chai
      .request(baseURL)
      .post(`${apiPrefix}/users/signin`)
      .send({
        email: global.testAccounts.seller1.email,
        password: global.testAccounts.seller1.password
      });

    if (res.body.success) {
      sellerId = res.body.user.user_id;
    }
  });

  describe('18. GET /sellers/:userId - Get Seller Information', () => {
    it('should get seller information by ID', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/sellers/${sellerId}`);

      if (res.status === 200) {
        validateSuccessResponse(res, 200);
        expect(res.body).to.have.property('seller');
        expect(res.body.seller).to.have.property('user_id');
        expect(res.body.seller).to.have.property('username');
        expect(res.body.seller).to.have.property('user_role').that.equals('seller');
      } else {
        validateErrorResponse(res, 404);
      }
    });

    it('should return 404 for non-existent seller', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/sellers/999999`);

      validateErrorResponse(res, 404);
    });

    it('should return 400 for non-seller user ID', async () => {
      // Try to get buyer as seller
      const buyerRes = await chai
        .request(baseURL)
        .post(`${apiPrefix}/users/signin`)
        .send({
          email: global.testAccounts.buyer1.email,
          password: global.testAccounts.buyer1.password
        });

      if (buyerRes.body.success) {
        const buyerId = buyerRes.body.user.user_id;
        const res = await chai
          .request(baseURL)
          .get(`${apiPrefix}/sellers/${buyerId}`);

        validateErrorResponse(res, 400);
      }
    });
  });

  describe('19. GET /sellers/:userId/listings - Get Seller Listings', () => {
    it('should get all listings from a seller', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/sellers/${sellerId}/listings`);

      validateSuccessResponse(res, 200);
      expect(res.body).to.have.property('listings');
      expect(res.body.listings).to.be.an('array');
      expect(res.body).to.have.property('pagination');
    });

    it('should filter seller listings by search query', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/sellers/${sellerId}/listings?q=test`);

      validateSuccessResponse(res, 200);
      expect(res.body.listings).to.be.an('array');
    });

    it('should filter seller listings by price range', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/sellers/${sellerId}/listings?minPrice=1000&maxPrice=50000`);

      validateSuccessResponse(res, 200);
      expect(res.body.listings).to.be.an('array');
    });

    it('should filter seller listings by status', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/sellers/${sellerId}/listings?status=active`);

      validateSuccessResponse(res, 200);
      expect(res.body.listings).to.be.an('array');
    });

    it('should sort seller listings', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/sellers/${sellerId}/listings?sort=price_low`);

      validateSuccessResponse(res, 200);
      expect(res.body.listings).to.be.an('array');
    });

    it('should paginate seller listings', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/sellers/${sellerId}/listings?page=1&limit=5`);

      validateSuccessResponse(res, 200);
      if (res.body.pagination) {
        expect(res.body.pagination.itemsPerPage).to.equal(5);
      }
    });
  });

  describe('20. GET /sellers/:userId/reviews - Get Seller Reviews', () => {
    it('should get seller reviews', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/sellers/${sellerId}/reviews`);

      validateSuccessResponse(res, 200);
      expect(res.body).to.have.property('reviews');
      expect(res.body.reviews).to.be.an('array');
    });

    it('should paginate seller reviews', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/sellers/${sellerId}/reviews?limit=10&offset=0`);

      validateSuccessResponse(res, 200);
      expect(res.body.reviews).to.be.an('array');
    });

    it('should return empty array for seller with no reviews', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/sellers/${sellerId}/reviews`);

      validateSuccessResponse(res, 200);
      expect(res.body.reviews).to.be.an('array');
    });
  });

  describe('21. GET /sellers/:userId/stats - Get Seller Statistics', () => {
    it('should get seller statistics', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/sellers/${sellerId}/stats`);

      validateSuccessResponse(res, 200);
      expect(res.body).to.have.property('stats');
      expect(res.body.stats).to.be.an('object');
      expect(res.body.stats).to.have.property('total_listings');
      expect(res.body.stats).to.have.property('active_listings');
      expect(res.body.stats).to.have.property('sold_listings');
      expect(res.body.stats).to.have.property('total_views');
      expect(res.body.stats).to.have.property('total_reviews');
      expect(res.body.stats).to.have.property('average_rating');
    });

    it('should return stats for seller with no activity', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/sellers/${sellerId}/stats`);

      validateSuccessResponse(res, 200);
      expect(res.body.stats).to.be.an('object');
    });

    it('should return 404 for non-existent seller', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/sellers/999999/stats`);

      validateErrorResponse(res, 404);
    });
  });
});
