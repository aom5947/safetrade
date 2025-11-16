import { expect, chai, tokens, validateSuccessResponse, validateErrorResponse } from '../helpers.js';

const baseURL = global.testConfig.baseURL;
const apiPrefix = global.testConfig.apiPrefix;

describe('Saved Listing Endpoints', function() {
  this.timeout(global.testConfig.timeout);

  let testListingId;

  before(async () => {
    // Get an existing listing to test with
    const res = await chai
      .request(baseURL)
      .get(`${apiPrefix}/listings?limit=1`);

    if (res.body.success && res.body.listings.length > 0) {
      testListingId = res.body.listings[0].listing_id;
    }
  });

  describe('33. POST /saved-listings - Save Listing', () => {
    it('should save a listing', async () => {
      if (!testListingId) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/saved-listings`)
        .set('Authorization', `Bearer ${tokens.buyer1}`)
        .send({ listingId: testListingId });

      if (res.status === 201) {
        validateSuccessResponse(res, 201);
        expect(res.body).to.have.property('data');
        expect(res.body.data).to.have.property('savedId');
      } else if (res.status === 400) {
        // Already saved
        expect(res.body).to.have.property('success').that.equals(false);
      }
    });

    it('should reject saving without authentication', async () => {
      if (!testListingId) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/saved-listings`)
        .send({ listingId: testListingId });

      validateErrorResponse(res, 401);
    });

    it('should reject saving with missing listing_id', async () => {
      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/saved-listings`)
        .set('Authorization', `Bearer ${tokens.buyer1}`)
        .send({});

      validateErrorResponse(res, 400);
    });

    it('should reject saving non-existent listing', async () => {
      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/saved-listings`)
        .set('Authorization', `Bearer ${tokens.buyer1}`)
        .send({ listing_id: 999999 });

      validateErrorResponse(res, 404);
    });
  });

  describe('34. DELETE /saved-listings/:listingId - Unsave Listing', () => {
    before(async () => {
      // Ensure the listing is saved before trying to unsave
      if (testListingId) {
        await chai
          .request(baseURL)
          .post(`${apiPrefix}/saved-listings`)
          .set('Authorization', `Bearer ${tokens.buyer1}`)
          .send({ listingId: testListingId });
      }
    });

    it('should unsave a listing', async () => {
      if (!testListingId) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .delete(`${apiPrefix}/saved-listings/${testListingId}`)
        .set('Authorization', `Bearer ${tokens.buyer1}`);

      validateSuccessResponse(res, 200);
    });

    it('should reject unsaving without authentication', async () => {
      if (!testListingId) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .delete(`${apiPrefix}/saved-listings/${testListingId}`);

      validateErrorResponse(res, 401);
    });

    it('should return 404 for unsaving non-saved listing', async () => {
      const res = await chai
        .request(baseURL)
        .delete(`${apiPrefix}/saved-listings/999999`)
        .set('Authorization', `Bearer ${tokens.buyer1}`);

      validateErrorResponse(res, 404);
    });
  });

  describe('35. GET /saved-listings - Get Saved Listings', () => {
    before(async () => {
      // Save a listing for testing
      if (testListingId) {
        await chai
          .request(baseURL)
          .post(`${apiPrefix}/saved-listings`)
          .set('Authorization', `Bearer ${tokens.buyer1}`)
          .send({ listingId: testListingId });
      }
    });

    it('should get user\'s saved listings', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/saved-listings`)
        .set('Authorization', `Bearer ${tokens.buyer1}`);

      validateSuccessResponse(res, 200);
      expect(res.body).to.have.property('savedListings');
      expect(res.body.savedListings).to.be.an('array');
    });

    it('should paginate saved listings', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/saved-listings?limit=5&offset=0`)
        .set('Authorization', `Bearer ${tokens.buyer1}`);

      validateSuccessResponse(res, 200);
      expect(res.body.savedListings).to.be.an('array');
    });

    it('should reject getting saved listings without authentication', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/saved-listings`);

      validateErrorResponse(res, 401);
    });

    it('should return empty array for user with no saved listings', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/saved-listings`)
        .set('Authorization', `Bearer ${tokens.seller1}`);

      validateSuccessResponse(res, 200);
      expect(res.body.savedListings).to.be.an('array');
    });
  });

  describe('36. GET /saved-listings/check/:listingId - Check If Listing is Saved', () => {
    it('should check if listing is saved', async () => {
      if (!testListingId) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/saved-listings/check/${testListingId}`)
        .set('Authorization', `Bearer ${tokens.buyer1}`);

      validateSuccessResponse(res, 200);
      expect(res.body).to.have.property('isSaved');
      expect(res.body.isSaved).to.be.a('boolean');
    });

    it('should reject check without authentication', async () => {
      if (!testListingId) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/saved-listings/check/${testListingId}`);

      validateErrorResponse(res, 401);
    });

    it('should return false for non-saved listing', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/saved-listings/check/999999`)
        .set('Authorization', `Bearer ${tokens.buyer1}`);

      validateSuccessResponse(res, 200);
      expect(res.body.isSaved).to.equal(false);
    });
  });

  describe('37. GET /saved-listings/count/:listingId - Get Save Count', () => {
    it('should get save count for a listing', async () => {
      if (!testListingId) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/saved-listings/count/${testListingId}`);

      validateSuccessResponse(res, 200);
      expect(res.body).to.have.property('saveCount');
      expect(res.body.saveCount).to.be.a('number');
      expect(res.body.saveCount).to.be.at.least(0);
    });

    it('should return 0 for listing with no saves', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/saved-listings/count/999999`);

      validateSuccessResponse(res, 200);
      expect(res.body.saveCount).to.equal(0);
    });

    it('should work without authentication (public endpoint)', async () => {
      if (!testListingId) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/saved-listings/count/${testListingId}`);

      validateSuccessResponse(res, 200);
      expect(res.body).to.have.property('saveCount');
    });
  });
});
