const request = require("supertest");
const app = require("../main-system");

describe("Roster Export", () => {

  test("IT-05: Export roster JSON", async () => {
    const res = await request(app)
      .get("/api/roster/TK900/export"); // REAL flight

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.text).toContain("flight");
  });

});
