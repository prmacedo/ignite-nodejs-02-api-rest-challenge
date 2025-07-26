import { FastifyInstance } from "fastify";
import z from "zod";
import { randomUUID } from "node:crypto";
import { knex } from "../database";
import { checkUserIdExists } from "../middlewares/check-user-id-exists";

export async function usersRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    const users = await knex.table("users").select("*");
    return { users };
  });

  app.get(
    "/metrics",
    { preHandler: [checkUserIdExists] },
    async (request, reply) => {
      const { userId } = request.cookies;

      const totalMeals = await knex("meals")
        .where("user_id", userId)
        .orderBy(["date", { column: "time", order: "asc" }])
        .select("is_on_diet");

      const mealsGroupedByDiet = await knex("meals")
        .where("user_id", userId)
        .groupBy("is_on_diet")
        .orderBy(["date", { column: "time", order: "asc" }])
        .select("is_on_diet")
        .count("is_on_diet", { as: "total" });

      let mealsOnDiet = 0;
      let mealsOffDiet = 0;

      for (const group of mealsGroupedByDiet) {
        if (group.is_on_diet) {
          mealsOnDiet = Number(group.total ?? 0);
        } else {
          mealsOffDiet = Number(group.total ?? 0);
        }
      }

      const { bestOnDietStreak } = totalMeals.reduce(
        (acc, meal) => {
          if (meal.is_on_diet) {
            acc.currentStreak++;
          } else {
            acc.currentStreak = 0;
          }

          if (acc.currentStreak > acc.bestOnDietStreak) {
            acc.bestOnDietStreak = acc.currentStreak;
          }

          return acc;
        },
        {
          bestOnDietStreak: 0,
          currentStreak: 0,
        }
      );

      return {
        totalMeals: totalMeals.length,
        mealsOnDiet: mealsOnDiet,
        mealsOffDiet: mealsOffDiet,
        bestOnDietStreak,
      };
    }
  );

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

    reply.setCookie("userId", id, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return reply.status(201).send();
  });
}
