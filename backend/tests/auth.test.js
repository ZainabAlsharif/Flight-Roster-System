const request = require("supertest");
const app = require("../main-system");

describe("Authentication (Black Box + Integration)", () => {

  test("BB-L-01: Valid login", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ staffId: "1", password: "pilot1" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("userId");
    expect(res.body).toHaveProperty("role");
  });

  test("BB-L-02: Wrong password", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ staffId: "1", password: "wrong" });

    expect(res.statusCode).toBe(401);
  });

  test("BB-L-03: Non-existing user", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ staffId: "9999", password: "x" });

    expect(res.statusCode).toBe(401);
  });

  test("BB-L-04: Missing staffId", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ password: "pilot1" });

    expect(res.statusCode).toBe(400);
  });

  test("BB-L-05: Missing password", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ staffId: "1" });

    expect(res.statusCode).toBe(400);
  });

});
