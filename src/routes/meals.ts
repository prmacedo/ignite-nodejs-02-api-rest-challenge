import { FastifyInstance } from "fastify";

export async function mealsRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    return "All meals";
  });
}
