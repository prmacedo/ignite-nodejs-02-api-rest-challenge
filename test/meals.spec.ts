import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { execSync } from "node:child_process";
import request from "supertest";
import { app } from "../src/app";

describe("Meals routes", () => {
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

  it("should be able to create a new meal for the user", async () => {
    const createUserResponse = await request(app.server)
      .post("/users")
      .send({
        name: "User Test",
      })
      .expect(201);

    const cookies = createUserResponse.get("Set-Cookie")!;

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies)
      .send({
        name: "New Meal",
        description: "New Meal Description",
        isOnDiet: true,
        date: "2025-07-26",
        time: "19:30",
      })
      .expect(201);
  });

  it("should be able to list all user's meals", async () => {
    const createUserResponse = await request(app.server)
      .post("/users")
      .send({
        name: "User Test",
      })
      .expect(201);

    const cookies = createUserResponse.get("Set-Cookie")!;

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies)
      .send({
        name: "New Meal",
        description: "New Meal Description",
        isOnDiet: true,
        date: "2025-07-26",
        time: "19:30",
      })
      .expect(201);

    const listUserMealsResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies)
      .expect(200);

    expect(listUserMealsResponse.body.meals).toEqual([
      expect.objectContaining({
        name: "New Meal",
        description: "New Meal Description",
        is_on_diet: 1,
        date: "2025-07-26",
        time: "19:30",
      }),
    ]);
  });

  it("should be able to list one of the user's meals", async () => {
    const createUserResponse = await request(app.server)
      .post("/users")
      .send({
        name: "User Test",
      })
      .expect(201);

    const cookies = createUserResponse.get("Set-Cookie")!;

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies)
      .send({
        name: "New Meal",
        description: "New Meal Description",
        isOnDiet: true,
        date: "2025-07-26",
        time: "19:30",
      })
      .expect(201);

    const listUserMealsResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies)
      .expect(200);

    const mealsId = listUserMealsResponse.body.meals[0].id;

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealsId}`)
      .set("Cookie", cookies)
      .expect(200);

    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: "New Meal",
        description: "New Meal Description",
        is_on_diet: 1,
        date: "2025-07-26",
        time: "19:30",
      })
    );
  });

  it("should be able to update one of the user's meals", async () => {
    const createUserResponse = await request(app.server)
      .post("/users")
      .send({
        name: "User Test",
      })
      .expect(201);

    const cookies = createUserResponse.get("Set-Cookie")!;

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies)
      .send({
        name: "New Meal",
        description: "New Meal Description",
        isOnDiet: true,
        date: "2025-07-26",
        time: "19:30",
      })
      .expect(201);

    const listUserMealsResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies)
      .expect(200);

    const mealsId = listUserMealsResponse.body.meals[0].id;

    await request(app.server)
      .put(`/meals/${mealsId}`)
      .set("Cookie", cookies)
      .send({
        name: "Updated Meal",
      })
      .expect(204);

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealsId}`)
      .set("Cookie", cookies)
      .expect(200);

    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: "Updated Meal",
        description: "New Meal Description",
        is_on_diet: 1,
        date: "2025-07-26",
        time: "19:30",
      })
    );
  });

  it("should be able to delete one of the user's meals", async () => {
    const createUserResponse = await request(app.server)
      .post("/users")
      .send({
        name: "User Test",
      })
      .expect(201);

    const cookies = createUserResponse.get("Set-Cookie")!;

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies)
      .send({
        name: "New Meal",
        description: "New Meal Description",
        isOnDiet: true,
        date: "2025-07-26",
        time: "19:30",
      })
      .expect(201);

    const listUserMealsResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies)
      .expect(200);

    const mealsId = listUserMealsResponse.body.meals[0].id;

    await request(app.server)
      .delete(`/meals/${mealsId}`)
      .set("Cookie", cookies)
      .send({
        name: "Updated Meal",
      })
      .expect(204);

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealsId}`)
      .set("Cookie", cookies)
      .expect(200);

    expect(getMealResponse.body).toEqual({});
  });
});
