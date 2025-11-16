import { expect, chai, tokens, testData, validateSuccessResponse, validateErrorResponse, validatePagination } from '../helpers.js';

const baseURL = global.testConfig.baseURL;
const apiPrefix = global.testConfig.apiPrefix;

describe('Listing Endpoints', function() {
  this.timeout(global.testConfig.timeout);

  let testListingId;
  let testImageId;

  describe('9. GET /listings - Get All Listings', () => {
    it('should get all active listings without filters', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/listings`);

      validateSuccessResponse(res, 200);
      expect(res.body).to.have.property('listings');
      expect(res.body.listings).to.be.an('array');
      expect(res.body).to.have.property('pagination');
      validatePagination(res.body.pagination);
    });

    it('should filter listings by search query', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/listings?q=phone`);

      validateSuccessResponse(res, 200);
      expect(res.body.listings).to.be.an('array');
    });

    it('should filter listings by price range', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/listings?minPrice=1000&maxPrice=50000`);

      validateSuccessResponse(res, 200);
      expect(res.body.listings).to.be.an('array');
    });

    it('should sort listings by newest', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/listings?sort=newest`);

      validateSuccessResponse(res, 200);
      expect(res.body.listings).to.be.an('array');
    });

    it('should paginate results', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/listings?page=1&limit=5`);

      validateSuccessResponse(res, 200);
      expect(res.body.pagination.itemsPerPage).to.equal(5);
    });
  });

  describe('10. GET /listings/:id - Get Single Listing', () => {
    it('should get listing details by ID', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/listings/1`);

      if (res.status === 200) {
        validateSuccessResponse(res, 200);
        expect(res.body).to.have.property('listing');
        expect(res.body.listing).to.have.property('listing_id');
        expect(res.body.listing).to.have.property('title');
        expect(res.body.listing).to.have.property('price');
      } else {
        validateErrorResponse(res, 404);
      }
    });

    it('should return 404 for non-existent listing', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/listings/999999`);

      validateErrorResponse(res, 404);
    });
  });

  describe('11. POST /listings - Create Listing', () => {
    it('should create a new listing as seller', async () => {
      const listingData = {
        categoryId: 1,
        title: `Test Listing ${Date.now()}`,
        description: 'This is a test listing for automated testing',
        price: 15000,
        location: 'Bangkok',
        images: []
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/listings`)
        .set('Authorization', `Bearer ${tokens.seller1}`)
        .send(listingData);

      validateSuccessResponse(res, 201);
      expect(res.body).to.have.property('listingId');

      // Store for later tests
      testListingId = res.body.listingId;
      testData.listingIds.test1 = testListingId;
    });

    it('should reject listing creation without authentication', async () => {
      const listingData = {
        categoryId: 1,
        title: 'Test Listing',
        description: 'Test description',
        price: 15000,
        location: 'Bangkok'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/listings`)
        .send(listingData);

      validateErrorResponse(res, 401);
    });

    it('should reject listing with missing required fields', async () => {
      const listingData = {
        title: 'Incomplete Listing'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/listings`)
        .set('Authorization', `Bearer ${tokens.seller1}`)
        .send(listingData);

      validateErrorResponse(res, 400);
    });

    it('should reject listing creation by buyer', async () => {
      const listingData = {
        categoryId: 1,
        title: 'Buyer Test Listing',
        description: 'Test description',
        price: 15000,
        location: 'Bangkok'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/listings`)
        .set('Authorization', `Bearer ${tokens.buyer1}`)
        .send(listingData);

      validateErrorResponse(res, 403);
    });
  });

  describe('12. GET /listings/my/listings - Get My Listings', () => {
    it('should get seller\'s own listings', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/listings/my/listings`)
        .set('Authorization', `Bearer ${tokens.seller1}`);

      validateSuccessResponse(res, 200);
      expect(res.body).to.have.property('listings');
      expect(res.body.listings).to.be.an('array');
    });

    it('should reject without authentication', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/listings/my/listings`);

      validateErrorResponse(res, 401);
    });
  });

  describe('13. PUT /listings/:id - Update Listing', () => {
    it('should update listing as owner', async () => {
      const updateData = {
        title: `Updated Listing ${Date.now()}`,
        description: 'Updated description',
        price: 20000
      };

      const res = await chai
        .request(baseURL)
        .put(`${apiPrefix}/listings/${testListingId}`)
        .set('Authorization', `Bearer ${tokens.seller1}`)
        .send(updateData);

      validateSuccessResponse(res, 200);
      expect(res.body).to.have.property('listing');
    });

    it('should reject update by non-owner', async () => {
      const updateData = {
        title: 'Unauthorized Update'
      };

      const res = await chai
        .request(baseURL)
        .put(`${apiPrefix}/listings/${testListingId}`)
        .set('Authorization', `Bearer ${tokens.buyer1}`)
        .send(updateData);

      validateErrorResponse(res, 403);
    });

    it('should reject update without authentication', async () => {
      const updateData = {
        title: 'No Auth Update'
      };

      const res = await chai
        .request(baseURL)
        .put(`${apiPrefix}/listings/${testListingId}`)
        .send(updateData);

      validateErrorResponse(res, 401);
    });
  });

  describe('14. PATCH /listings/:id/status - Update Listing Status', () => {
    it('should update listing status to sold', async () => {
      const res = await chai
        .request(baseURL)
        .patch(`${apiPrefix}/listings/${testListingId}/status`)
        .set('Authorization', `Bearer ${tokens.seller1}`)
        .send({ status: 'sold' });

      validateSuccessResponse(res, 200);
      expect(res.body).to.have.property('listing');
    });

    it('should update listing status to active', async () => {
      const res = await chai
        .request(baseURL)
        .patch(`${apiPrefix}/listings/${testListingId}/status`)
        .set('Authorization', `Bearer ${tokens.seller1}`)
        .send({ status: 'active' });

      validateSuccessResponse(res, 200);
    });

    it('should reject invalid status', async () => {
      const res = await chai
        .request(baseURL)
        .patch(`${apiPrefix}/listings/${testListingId}/status`)
        .set('Authorization', `Bearer ${tokens.seller1}`)
        .send({ status: 'invalid_status' });

      validateErrorResponse(res, 400);
    });
  });

  describe('15. DELETE /listings/:id - Delete Listing', () => {
    let listingToDelete;

    before(async () => {
      // Create a listing to delete
      const listingData = {
        categoryId: 1,
        title: `To Delete ${Date.now()}`,
        description: 'This listing will be deleted',
        price: 10000,
        location: 'Bangkok'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/listings`)
        .set('Authorization', `Bearer ${tokens.seller1}`)
        .send(listingData);

      listingToDelete = res.body.listingId;
    });

    it('should delete listing as owner', async () => {
      const res = await chai
        .request(baseURL)
        .delete(`${apiPrefix}/listings/${listingToDelete}`)
        .set('Authorization', `Bearer ${tokens.seller1}`);

      validateSuccessResponse(res, 200);
    });

    it('should reject deletion without authentication', async () => {
      const res = await chai
        .request(baseURL)
        .delete(`${apiPrefix}/listings/999`);

      validateErrorResponse(res, 401);
    });
  });

  describe('16. POST /listings/:id/images - Add Images to Listing', () => {
    it('should add images to listing', async () => {
      const imageData = {
        images: [
          'https://utfs.io/f/test-image-1.jpg',
          'https://utfs.io/f/test-image-2.jpg'
        ]
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/listings/${testListingId}/images`)
        .set('Authorization', `Bearer ${tokens.seller1}`)
        .send(imageData);

      validateSuccessResponse(res, 201);
      expect(res.body).to.have.property('images');
      expect(res.body.images).to.be.an('array');

      if (res.body.images && res.body.images.length > 0) {
        testImageId = res.body.images[0].image_id;
      }
    });

    it('should reject adding images without authentication', async () => {
      const imageData = {
        images: [
          'https://utfs.io/f/test.jpg'
        ]
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/listings/${testListingId}/images`)
        .send(imageData);

      validateErrorResponse(res, 401);
    });
  });

  describe('17. DELETE /listings/images/:imageId - Delete Listing Image', () => {
    it('should delete listing image', async () => {
      if (!testImageId) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .delete(`${apiPrefix}/listings/images/${testImageId}`)
        .set('Authorization', `Bearer ${tokens.seller1}`);

      validateSuccessResponse(res, 200);
    });

    it('should reject image deletion without authentication', async () => {
      const res = await chai
        .request(baseURL)
        .delete(`${apiPrefix}/listings/images/999`);

      validateErrorResponse(res, 401);
    });
  });
});
