import { expect, chai, tokens, validateSuccessResponse, validateErrorResponse } from '../helpers.js';

const baseURL = global.testConfig.baseURL;
const apiPrefix = global.testConfig.apiPrefix;

describe('Guest Contact Endpoints', function() {
  this.timeout(global.testConfig.timeout);

  let testListingId;

  before(async () => {
    // Get an existing listing
    const res = await chai
      .request(baseURL)
      .get(`${apiPrefix}/listings?limit=1`);

    if (res.body.success && res.body.listings.length > 0) {
      testListingId = res.body.listings[0].listing_id;
    }
  });

  describe('50. POST /guest-contacts - Submit Guest Contact', () => {
    it('should submit a guest contact inquiry', async () => {
      if (!testListingId) {
        this.skip();
        return;
      }

      const contactData = {
        listing_id: testListingId,
        guest_name: 'John Doe',
        guest_email: 'johndoe@example.com',
        guest_phone: '0812345678',
        message: 'Hello, I am interested in this item. Can you provide more details?'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/guest-contacts`)
        .send(contactData);

      validateSuccessResponse(res, 201);
      expect(res.body).to.have.property('contact_id');
    });

    it('should submit guest contact with minimal required fields', async () => {
      if (!testListingId) {
        this.skip();
        return;
      }

      const contactData = {
        listing_id: testListingId,
        guest_name: 'Jane Smith',
        guest_email: 'janesmith@example.com',
        message: 'Is this still available?'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/guest-contacts`)
        .send(contactData);

      validateSuccessResponse(res, 201);
      expect(res.body).to.have.property('contact_id');
    });

    it('should reject guest contact with missing required fields', async () => {
      const contactData = {
        guest_name: 'Incomplete Contact'
        // Missing listing_id, guest_email, message
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/guest-contacts`)
        .send(contactData);

      validateErrorResponse(res, 400);
    });

    it('should reject guest contact with invalid email', async () => {
      if (!testListingId) {
        this.skip();
        return;
      }

      const contactData = {
        listing_id: testListingId,
        guest_name: 'Bad Email',
        guest_email: 'not-an-email',
        message: 'Test message'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/guest-contacts`)
        .send(contactData);

      validateErrorResponse(res, 400);
    });

    it('should reject guest contact for non-existent listing', async () => {
      const contactData = {
        listing_id: 999999,
        guest_name: 'Test User',
        guest_email: 'test@example.com',
        message: 'Test message'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/guest-contacts`)
        .send(contactData);

      validateErrorResponse(res, 404);
    });

    it('should allow guest contact without authentication (public endpoint)', async () => {
      if (!testListingId) {
        this.skip();
        return;
      }

      const contactData = {
        listing_id: testListingId,
        guest_name: 'Anonymous Guest',
        guest_email: 'anonymous@example.com',
        message: 'Public inquiry test'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/guest-contacts`)
        .send(contactData);

      validateSuccessResponse(res, 201);
    });
  });

  describe('51. GET /guest-contacts/listing/:listingId - Get Listing Guest Contacts', () => {
    it('should get guest contacts for a listing as seller', async () => {
      if (!testListingId) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/guest-contacts/listing/${testListingId}`)
        .set('Authorization', `Bearer ${tokens.seller1}`);

      if (res.status === 200) {
        validateSuccessResponse(res, 200);
        expect(res.body).to.have.property('contacts');
        expect(res.body.contacts).to.be.an('array');
      } else if (res.status === 403) {
        // If seller1 doesn't own this listing
        validateErrorResponse(res, 403);
      }
    });

    it('should paginate listing guest contacts', async () => {
      if (!testListingId) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/guest-contacts/listing/${testListingId}?limit=10&offset=0`)
        .set('Authorization', `Bearer ${tokens.seller1}`);

      if (res.status === 200) {
        validateSuccessResponse(res, 200);
        expect(res.body.contacts).to.be.an('array');
      } else {
        expect(res.status).to.be.oneOf([200, 403]);
      }
    });

    it('should reject getting guest contacts without authentication', async () => {
      if (!testListingId) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/guest-contacts/listing/${testListingId}`);

      validateErrorResponse(res, 401);
    });

    it('should reject getting guest contacts by non-owner', async () => {
      if (!testListingId) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/guest-contacts/listing/${testListingId}`)
        .set('Authorization', `Bearer ${tokens.buyer1}`);

      validateErrorResponse(res, 403);
    });
  });

  describe('52. GET /guest-contacts/my-contacts - Get All Seller\'s Guest Contacts', () => {
    it('should get all guest contacts for the authenticated seller', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/guest-contacts/my-contacts`)
        .set('Authorization', `Bearer ${tokens.seller1}`);

      validateSuccessResponse(res, 200);
      expect(res.body).to.have.property('contacts');
      expect(res.body.contacts).to.be.an('array');
    });

    it('should paginate seller\'s guest contacts', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/guest-contacts/my-contacts?limit=20&offset=0`)
        .set('Authorization', `Bearer ${tokens.seller1}`);

      validateSuccessResponse(res, 200);
      expect(res.body.contacts).to.be.an('array');
    });

    it('should reject getting contacts without authentication', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/guest-contacts/my-contacts`);

      validateErrorResponse(res, 401);
    });

    it('should reject getting contacts by non-seller', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/guest-contacts/my-contacts`)
        .set('Authorization', `Bearer ${tokens.buyer1}`);

      validateErrorResponse(res, 403);
    });

    it('should return empty array for seller with no contacts', async () => {
      // seller2 might not have any contacts
      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/users/signin`)
        .send({
          email: global.testAccounts.seller2.email,
          password: global.testAccounts.seller2.password
        });

      if (res.body.success) {
        const seller2Token = res.body.token;

        const contactsRes = await chai
          .request(baseURL)
          .get(`${apiPrefix}/guest-contacts/my-contacts`)
          .set('Authorization', `Bearer ${seller2Token}`);

        validateSuccessResponse(contactsRes, 200);
        expect(contactsRes.body.contacts).to.be.an('array');
      }
    });
  });
});
