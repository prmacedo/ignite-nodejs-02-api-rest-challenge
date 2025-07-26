import { Knex } from "knex";

declare module "knex/types/tables" {
  interface User {
    id: string;
    name: string;
    avatar?: string;
    created_at: string;
    updated_at: string;
  }

  interface Meals {
    id: string;
    user_id: string;
    name: string;
    description: string;
    date: string;
    time: string;
    is_on_diet: boolean;
    created_at: string;
    updated_at: string;
  }

  interface Tables {
    users: User;
    meals: Meals;
  }
}
