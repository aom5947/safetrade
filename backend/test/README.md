# API Test Suite

Comprehensive test suite for C2C Marketplace API using Mocha, Chai, and Mochawesome.

## Overview

This test suite covers **59 endpoints** across 10 categories:
- User Endpoints (8 endpoints)
- Listing Endpoints (9 endpoints)
- Seller Endpoints (4 endpoints)
- Category Endpoints (6 endpoints)
- Review Endpoints (6 endpoints)
- Saved Listing Endpoints (5 endpoints)
- Report Endpoints (5 endpoints)
- Conversation Endpoints (7 endpoints)
- Guest Contact Endpoints (3 endpoints)
- Admin Endpoints (5 endpoints)

## Prerequisites

1. **Database must be running** with test data seeded
2. **Server must be running** on `http://localhost:3000` (or configured HOST:PORT)
3. **Test accounts must exist** in the database:
   - `superadmin@marketplace.com` (password: `password123`)
   - `admin@marketplace.com` (password: `password123`)
   - `seller1@test.com` (password: `password123`)
   - `seller2@test.com` (password: `password123`)
   - `buyer1@test.com` (password: `password123`)

## Installation

Dependencies are already installed, but if needed:

```bash
npm install --save-dev mocha chai chai-http mochawesome
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests with HTML report
```bash
npm run test:report
```

### Run specific test file
```bash
npx mocha test/api/01-user.test.js
```

### Run with verbose output
```bash
npx mocha --reporter spec
```

## Test Reports

After running tests, the Mochawesome report will be generated in:
- **HTML Report**: `test-results/api-test-report.html`
- **JSON Report**: `test-results/api-test-report.json`

Open the HTML report in your browser to view:
- Pass/Fail statistics
- Detailed test results
- Execution time for each test
- Test structure and hierarchy

## Test Structure

```
test/
├── api/
│   ├── 01-user.test.js           # User authentication & profile tests
│   ├── 02-listing.test.js        # Listing CRUD operations tests
│   ├── 03-seller.test.js         # Seller information & statistics tests
│   ├── 04-category.test.js       # Category management tests
│   ├── 05-review.test.js         # Review system tests
│   ├── 06-saved-listing.test.js  # Saved/bookmarked listings tests
│   ├── 07-report.test.js         # Report submission & management tests
│   ├── 08-conversation.test.js   # Messaging system tests
│   ├── 09-guest-contact.test.js  # Guest contact form tests
│   └── 10-admin.test.js          # Admin panel operations tests
├── helpers.js                     # Test utilities and helper functions
├── setup.js                       # Test environment configuration
└── README.md                      # This file
```

## Configuration

Test configuration is in `.mocharc.json`:
- Timeout: 30 seconds per test
- Reporter: Mochawesome with detailed settings
- Setup file: `test/setup.js`

Environment variables (from `.env`):
- `HOST`: Server hostname (default: localhost)
- `PORT`: Server port (default: 3000)
- `API_PREFIX`: API prefix (default: /api/v1)

## Test Features

### Authentication Testing
- JWT token validation
- Basic Auth for super admin endpoints
- Role-based access control (RBAC)

### Validation Testing
- Required fields validation
- Data type validation
- Business logic validation

### Error Handling
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found

### Success Scenarios
- CRUD operations
- Pagination and filtering
- Search functionality
- Complex queries

## Helper Functions

Available in `test/helpers.js`:

- `loginUser(email, password)` - Get JWT token for a user
- `getBasicAuthHeader(email, password)` - Get Basic Auth header
- `validateSuccessResponse(res, statusCode)` - Validate success responses
- `validateErrorResponse(res, statusCode)` - Validate error responses
- `validatePagination(pagination)` - Validate pagination structure

## Troubleshooting

### Tests failing with connection errors
- Ensure the server is running: `npm start` or `npm run dev`
- Check the database connection
- Verify environment variables in `.env`

### Authentication failures
- Ensure test accounts exist in the database
- Check password matches: `password123`
- Verify JWT secret is configured

### Database errors
- Check database is accessible
- Ensure tables are created
- Verify test data is seeded

## Test Coverage

### Endpoint Coverage: 100%
All 59 documented endpoints are tested with multiple scenarios.

### Test Scenarios per Endpoint:
- ✅ Success cases
- ✅ Authentication checks
- ✅ Authorization checks
- ✅ Validation errors
- ✅ Not found errors
- ✅ Edge cases

## Notes

- Tests are designed to run against a live development database
- Some tests create temporary data that is cleaned up
- Tests are executed sequentially to maintain data consistency
- Token sharing between tests ensures efficient execution
- Tests may skip if prerequisites are not met (e.g., no listings exist)

## Contributing

When adding new endpoints:
1. Create corresponding test file in `test/api/`
2. Follow existing naming convention: `##-feature.test.js`
3. Include all CRUD operations if applicable
4. Test both success and failure scenarios
5. Update this README with new endpoint count

## Related Documentation

- API Documentation: `API_EXAMPLES.md`
- Mocha: https://mochajs.org/
- Chai: https://www.chaijs.com/
- Mochawesome: https://github.com/adamgruber/mochawesome
