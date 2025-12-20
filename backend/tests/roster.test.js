const request = require("supertest");
const app = require("../main-system");

const agent = request.agent(app); // keeps session

describe("Roster Retrieval", () => {

  beforeAll(async () => {
    await agent
      .post("/api/login")
      .send({ staffId: "1", password: "pilot1" });
  });

  test("BB-R-01: Valid flight roster", async () => {
    const res = await agent.get("/api/roster/TK900"); // REAL flight number

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("flight");
    expect(res.body).toHaveProperty("passengers");
  });

  test("BB-R-03: Invalid flight number", async () => {
    const res = await agent.get("/api/roster/INVALID999");

    expect(res.statusCode).toBe(404);
  });

});
