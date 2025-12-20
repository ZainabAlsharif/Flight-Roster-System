const request = require("supertest");
const app = require("../main-system");

describe("Admin Authorization", () => {

  test("SEC-06: Non-admin cannot access admin flights", async () => {
    const res = await request(app)
      .get("/api/admin/flights");

    expect([401, 403]).toContain(res.statusCode);
  });

});
