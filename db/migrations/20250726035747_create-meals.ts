import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("meals", (table) => {
    table.uuid("id").primary();
    table.uuid("user_id").references("users.id").notNullable();
    table.string("name").notNullable();
    table.string("description").notNullable();
    table.date("date").notNullable();
    table.time("time").notNullable();
    table.boolean("is_on_diet").notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("meals");
}
