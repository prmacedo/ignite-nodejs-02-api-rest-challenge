import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { execSync } from "node:child_process";
import request from "supertest";
import { app } from "../src/app";

describe("Users routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  });

  it("should be able to create a new user", async () => {
    const createUserResponse = await request(app.server)
      .post("/users")
      .send({
        name: "User Test",
      })
      .expect(201);

    const cookies = createUserResponse.get("Set-Cookie");

    expect(cookies).toEqual(
      expect.arrayContaining([expect.stringContaining("userId")])
    );
  });

  it("should be able to show user diet metrics", async () => {
    const createUserResponse = await request(app.server)
      .post("/users")
      .send({
        name: "User Test",
      })
      .expect(201);

    const cookies = createUserResponse.get("Set-Cookie")!;

    const metricsResponse = await request(app.server)
      .get("/users/metrics")
      .set("Cookie", cookies)
      .expect(200);

    expect(metricsResponse.body).toEqual(
      expect.objectContaining({
        totalMeals: 0,
        mealsOnDiet: 0,
        mealsOffDiet: 0,
        bestOnDietStreak: 0,
      })
    );
  });
});
