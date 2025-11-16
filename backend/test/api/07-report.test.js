import { expect, chai, tokens, testData, validateSuccessResponse, validateErrorResponse } from '../helpers.js';

const baseURL = global.testConfig.baseURL;
const apiPrefix = global.testConfig.apiPrefix;

describe('Report Endpoints', function() {
  this.timeout(global.testConfig.timeout);

  let testReportId;
  let testListingId;

  before(async () => {
    // Get an existing listing to report
    const res = await chai
      .request(baseURL)
      .get(`${apiPrefix}/listings?limit=1`);

    if (res.body.success && res.body.listings.length > 0) {
      testListingId = res.body.listings[0].listing_id;
    }
  });

  describe('38. POST /reports - Submit Report', () => {
    it('should submit a listing report', async () => {
      if (!testListingId) {
        this.skip();
        return;
      }

      const reportData = {
        reportedType: 'listing',
        reportedId: testListingId,
        reason: 'This is a spam listing for testing purposes'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/reports`)
        .send(reportData);

      validateSuccessResponse(res, 201);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.have.property('reportId');

      testReportId = res.body.data.reportId;
      testData.reportIds.test1 = testReportId;
    });

    it('should submit a report with authentication', async () => {
      if (!testListingId) {
        this.skip();
        return;
      }

      const reportData = {
        report_type: 'listing',
        reported_id: testListingId,
        reason: 'inappropriate',
        description: 'Inappropriate content test report'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/reports`)
        .set('Authorization', `Bearer ${tokens.buyer1}`)
        .send(reportData);

      validateSuccessResponse(res, 201);
      expect(res.body).to.have.property('report_id');
    });

    it('should reject report with missing required fields', async () => {
      const reportData = {
        report_type: 'listing'
        // Missing reported_id, reason
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/reports`)
        .send(reportData);

      validateErrorResponse(res, 400);
    });

    it('should reject report with invalid report_type', async () => {
      const reportData = {
        report_type: 'invalid_type',
        reported_id: 1,
        reason: 'spam',
        description: 'Test'
      };

      const res = await chai
        .request(baseURL)
        .post(`${apiPrefix}/reports`)
        .send(reportData);

      validateErrorResponse(res, 400);
    });
  });

  describe('39. GET /reports - Get All Reports', () => {
    it('should get all reports as admin', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/reports`)
        .set('Authorization', `Bearer ${tokens.admin}`);

      validateSuccessResponse(res, 200);
      expect(res.body).to.have.property('reports');
      expect(res.body.reports).to.be.an('array');
    });

    it('should filter reports by type', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/reports?type=listing`)
        .set('Authorization', `Bearer ${tokens.admin}`);

      validateSuccessResponse(res, 200);
      expect(res.body.reports).to.be.an('array');
    });

    it('should filter reports by status', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/reports?status=pending`)
        .set('Authorization', `Bearer ${tokens.admin}`);

      validateSuccessResponse(res, 200);
      expect(res.body.reports).to.be.an('array');
    });

    it('should paginate reports', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/reports?limit=10&offset=0`)
        .set('Authorization', `Bearer ${tokens.admin}`);

      validateSuccessResponse(res, 200);
      expect(res.body.reports).to.be.an('array');
    });

    it('should reject getting reports without authentication', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/reports`);

      validateErrorResponse(res, 401);
    });

    it('should reject getting reports by non-admin', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/reports`)
        .set('Authorization', `Bearer ${tokens.buyer1}`);

      validateErrorResponse(res, 403);
    });
  });

  describe('40. GET /reports/:reportId - Get Report Details', () => {
    it('should get report details as admin', async () => {
      if (!testReportId) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/reports/${testReportId}`)
        .set('Authorization', `Bearer ${tokens.admin}`);

      validateSuccessResponse(res, 200);
      expect(res.body).to.have.property('report');
      expect(res.body.report).to.have.property('report_id').that.equals(testReportId);
    });

    it('should reject getting report details without authentication', async () => {
      if (!testReportId) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/reports/${testReportId}`);

      validateErrorResponse(res, 401);
    });

    it('should reject getting report details by non-admin', async () => {
      if (!testReportId) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/reports/${testReportId}`)
        .set('Authorization', `Bearer ${tokens.seller1}`);

      validateErrorResponse(res, 403);
    });

    it('should return 404 for non-existent report', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/reports/999999`)
        .set('Authorization', `Bearer ${tokens.admin}`);

      validateErrorResponse(res, 404);
    });
  });

  describe('41. GET /reports/statistics - Get Report Statistics', () => {
    it('should get report statistics as admin', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/reports/statistics`)
        .set('Authorization', `Bearer ${tokens.admin}`);

      validateSuccessResponse(res, 200);
      expect(res.body).to.have.property('statistics');
      expect(res.body.statistics).to.be.an('object');
      expect(res.body.statistics).to.have.property('total_reports');
      expect(res.body.statistics).to.have.property('pending_reports');
      expect(res.body.statistics).to.have.property('resolved_reports');
    });

    it('should reject getting statistics without authentication', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/reports/statistics`);

      validateErrorResponse(res, 401);
    });

    it('should reject getting statistics by non-admin', async () => {
      const res = await chai
        .request(baseURL)
        .get(`${apiPrefix}/reports/statistics`)
        .set('Authorization', `Bearer ${tokens.buyer1}`);

      validateErrorResponse(res, 403);
    });
  });

  describe('42. PATCH /reports/:reportId/status - Update Report Status', () => {
    it('should update report status to reviewing', async () => {
      if (!testReportId) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .patch(`${apiPrefix}/reports/${testReportId}/status`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({
          status: 'reviewing',
          admin_notes: 'Under review for testing'
        });

      validateSuccessResponse(res, 200);
      expect(res.body).to.have.property('report');
    });

    it('should update report status to resolved', async () => {
      if (!testReportId) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .patch(`${apiPrefix}/reports/${testReportId}/status`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({
          status: 'resolved',
          admin_notes: 'Report resolved successfully'
        });

      validateSuccessResponse(res, 200);
    });

    it('should reject status update with invalid status', async () => {
      if (!testReportId) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .patch(`${apiPrefix}/reports/${testReportId}/status`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({
          status: 'invalid_status'
        });

      validateErrorResponse(res, 400);
    });

    it('should reject status update without authentication', async () => {
      if (!testReportId) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .patch(`${apiPrefix}/reports/${testReportId}/status`)
        .send({
          status: 'resolved'
        });

      validateErrorResponse(res, 401);
    });

    it('should reject status update by non-admin', async () => {
      if (!testReportId) {
        this.skip();
        return;
      }

      const res = await chai
        .request(baseURL)
        .patch(`${apiPrefix}/reports/${testReportId}/status`)
        .set('Authorization', `Bearer ${tokens.seller1}`)
        .send({
          status: 'resolved'
        });

      validateErrorResponse(res, 403);
    });
  });
});
