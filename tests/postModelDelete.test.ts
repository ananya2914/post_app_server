import { Knex } from 'knex';
import knexConfig from '../knexfile'; 
import PostModel from '../src/models/Posts'; 
import { afterAll, beforeEach, describe, expect, it } from '@jest/globals';

const testDb: Knex = require('knex')(knexConfig.test);

describe('PostModel delete method', () => {

  it('marks an existing post as deleted in the database', async () => {
    const existingPostId = 87;

    // Call the delete method and await the result
    const result: boolean = await PostModel.delete(existingPostId);

    // Assert that the result is true
    expect(result).toBe(true);

    // Verify that the post is marked as deleted
    const deletedPost = await testDb('test_posts').where({ id: existingPostId }).first();
    expect(deletedPost.is_deleted).toBe(true);
  });

  it('returns false when trying to delete a non-existing post', async () => {
    const nonExistingPostId = 9999;

    // Call the delete method and await the result
    const result: boolean = await PostModel.delete(nonExistingPostId);

    // Assert that the result is false
    expect(result).toBe(false);
  });

  // Add more test cases as needed
});
