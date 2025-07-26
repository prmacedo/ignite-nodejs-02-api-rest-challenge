import { FastifyInstance } from "fastify";
import z from "zod";
import { randomUUID } from "node:crypto";

import { knex } from "../database";
import { checkUserIdExists } from "../middlewares/check-user-id-exists";

export async function mealsRoutes(app: FastifyInstance) {
  app.addHook("preHandler", checkUserIdExists);

  app.get("/", async (request) => {
    const { userId } = request.cookies;

    const meals = await knex.table("meals").where("user_id", userId).select();

    return { meals };
  });

  app.post("/", async (request, reply) => {
    const { userId } = request.cookies;

    const createMealsBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      isOnDiet: z.boolean(),
      date: z.iso.date(),
      time: z.iso.time(),
    });

    const { name, description, isOnDiet, date, time } =
      createMealsBodySchema.parse(request.body);

    await knex("meals").insert({
      id: randomUUID(),
      name,
      description,
      is_on_diet: isOnDiet,
      date,
      time,
      user_id: userId,
    });

    return reply.status(201).send();
  });
}
