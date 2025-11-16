import chai from 'chai';
import chaiHttp from 'chai-http';

const { expect } = chai;
chai.use(chaiHttp);

// Store tokens for authenticated requests
export const tokens = {
  superAdmin: null,
  admin: null,
  seller1: null,
  seller2: null,
  buyer1: null
};

// Store test data IDs
export const testData = {
  userIds: {},
  listingIds: {},
  categoryIds: {},
  reviewIds: {},
  conversationIds: {},
  reportIds: {}
};

/**
 * Helper function to login and get JWT token
 */
export async function loginUser(email, password) {
  const res = await chai
    .request(global.testConfig.baseURL)
    .post(`${global.testConfig.apiPrefix}/users/signin`)
    .send({ email, password });

  if (res.body.success && res.body.token) {
    return res.body.token;
  }
  throw new Error(`Login failed for ${email}`);
}

/**
 * Helper function to get Basic Auth header for super admin
 */
export function getBasicAuthHeader(email, password) {
  const credentials = Buffer.from(`${email}:${password}`).toString('base64');
  return `Basic ${credentials}`;
}

/**
 * Helper function to create a test user
 */
export async function createTestUser(userData) {
  const res = await chai
    .request(global.testConfig.baseURL)
    .post(`${global.testConfig.apiPrefix}/users/signup`)
    .send(userData);

  return res.body;
}

/**
 * Helper function to create a test listing
 */
export async function createTestListing(listingData, token) {
  const res = await chai
    .request(global.testConfig.baseURL)
    .post(`${global.testConfig.apiPrefix}/listings`)
    .set('Authorization', `Bearer ${token}`)
    .send(listingData);

  return res.body;
}

/**
 * Helper function to wait for a condition
 */
export function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validate standard success response structure
 */
export function validateSuccessResponse(res, statusCode = 200) {
  expect(res).to.have.status(statusCode);
  expect(res.body).to.be.an('object');
  expect(res.body).to.have.property('success').that.equals(true);
  expect(res.body).to.have.property('message');
}

/**
 * Validate standard error response structure
 */
export function validateErrorResponse(res, statusCode = 400) {
  expect(res).to.have.status(statusCode);
  expect(res.body).to.be.an('object');
  expect(res.body).to.have.property('success').that.equals(false);
  expect(res.body).to.have.property('message');
}

/**
 * Validate pagination structure
 */
export function validatePagination(pagination) {
  expect(pagination).to.be.an('object');
  expect(pagination).to.have.property('currentPage');
  expect(pagination).to.have.property('totalPages');
  expect(pagination).to.have.property('totalItems');
  expect(pagination).to.have.property('itemsPerPage');
}

export { expect, chai };
