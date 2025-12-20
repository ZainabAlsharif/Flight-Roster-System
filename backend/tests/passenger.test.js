const request = require("supertest");
const app = require("../main-system");

describe("Passenger Flight Search", () => {

  test("BB-P-01: Valid ticket", async () => {
    const res = await request(app)
      .post("/passenger-flight-search")
      .send({ ticketId: "00001" });

    expect(res.statusCode).toBe(302);
  });

  test("BB-P-02: Invalid ticket", async () => {
    const res = await request(app)
      .post("/passenger-flight-search")
      .send({ ticketId: "INVALID" });

    expect(res.statusCode).not.toBe(200);
  });

  test("BB-P-03: Empty ticket", async () => {
    const res = await request(app)
      .post("/passenger-flight-search")
      .send({});

    expect(res.statusCode).not.toBe(200);
  });

});
