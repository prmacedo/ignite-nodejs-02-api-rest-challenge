import knexConfig from "knex";
import { env } from "./env";

export const knex = knexConfig({
  client: env.DATABASE_CLIENT,
  connection: {
    filename: env.DATABASE_URL,
  },
});
