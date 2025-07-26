import { FastifyInstance } from "fastify";
import z from "zod";
import { randomUUID } from "node:crypto";
import { knex } from "../database";

export async function usersRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    const users = await knex.table("users").select("*");
    return { users };
  });

  app.post("/", async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      avatar: z.url().optional(),
    });

    const { name, avatar } = createUserBodySchema.parse(request.body);

    const id = randomUUID();

    await knex.table("users").insert({
      id,
      name,
      avatar,
    });

    reply.setCookie("user_id", id, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return reply.status(201).send();
  });
}
