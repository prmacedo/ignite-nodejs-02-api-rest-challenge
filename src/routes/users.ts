import { FastifyInstance } from "fastify";
import { knex } from "../database";

export async function usersRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    const users = await knex.table("users").select("*");
    return { users };
  });
}
