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

  app.get("/:id", async (request) => {
    const { userId } = request.cookies;

    const getMealParamsSchema = z.object({
      id: z.uuid(),
    });

    const { id } = getMealParamsSchema.parse(request.params);

    const meal = await knex("meals")
      .where({
        id,
        user_id: userId,
      })
      .select()
      .first();

    return { meal };
  });

  app.post("/", async (request, reply) => {
    const { userId } = request.cookies;

    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      isOnDiet: z.boolean(),
      date: z.iso.date(),
      time: z.iso.time(),
    });

    const { name, description, isOnDiet, date, time } =
      createMealBodySchema.parse(request.body);

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

  app.put("/:id", async (request, reply) => {
    const { userId } = request.cookies;

    const putMealParamsSchema = z.object({
      id: z.uuid(),
    });

    const { id } = putMealParamsSchema.parse(request.params);

    const putMealBodySchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      isOnDiet: z.boolean().optional(),
      date: z.iso.date().optional(),
      time: z.iso.time().optional(),
    });

    const _body = putMealBodySchema.safeParse(request.body);

    if (!_body.success) {
      console.log("Invalid body.", z.formatError(_body.error));
      return reply.status(400).send(z.formatError(_body.error));
    }

    const { name, description, isOnDiet, date, time } = _body.data;

    await knex("meals")
      .where({
        id,
        user_id: userId,
      })
      .update({
        name,
        description,
        is_on_diet: isOnDiet,
        date,
        time,
        updated_at: knex.fn.now(),
      });

    return reply.status(204).send();
  });

  app.delete("/:id", async (request, reply) => {
    const { userId } = request.cookies;

    const deleteMealParamsSchema = z.object({
      id: z.uuid(),
    });

    const { id } = deleteMealParamsSchema.parse(request.params);

    await knex("meals").where({ id, user_id: userId }).delete();

    return reply.status(204).send();
  });
}
