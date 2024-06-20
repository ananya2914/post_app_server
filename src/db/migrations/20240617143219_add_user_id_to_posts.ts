import { Knex } from 'knex';

export const up = async (knex: Knex): Promise<void> => {
  await knex.schema.table('posts', function(table) {
    table.integer('user_id').unsigned();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
  });
};

export const down = async (knex: Knex): Promise<void> => {
  await knex.schema.table('posts', function(table) {
    table.dropForeign('user_id');
    table.dropColumn('user_id');
  });
};
