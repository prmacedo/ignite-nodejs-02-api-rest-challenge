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

    const getMealsParamsSchema = z.object({
      id: z.uuid(),
    });

    const { id } = getMealsParamsSchema.parse(request.params);

    const meals = await knex("meals")
      .where({
        id,
        user_id: userId,
      })
      .select();

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

  app.put("/:id", async (request, reply) => {
    const { userId } = request.cookies;

    const putMealsParamsSchema = z.object({
      id: z.uuid(),
    });

    const { id } = putMealsParamsSchema.parse(request.params);

    const putMealsBodySchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      isOnDiet: z.boolean().optional(),
      date: z.iso.date().optional(),
      time: z.iso.time().optional(),
    });

    const _body = putMealsBodySchema.safeParse(request.body);

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
      });

    return reply.status(204).send();
  });
}
