import { Knex } from 'knex';
import knexConfig from '../knexfile';
import PostModel from '../src/models/Posts'; 
import { Post } from '../src/interfaces'; 
import { afterAll, beforeEach, describe, expect, it } from '@jest/globals';

const testDb: Knex = require('knex')(knexConfig.test);

describe('PostModel update method', () => {
  beforeEach(async () => {
    // Run migrations and seed data for a clean slate before each test
    await testDb.migrate.latest();
  });

  afterAll(async () => {
    // Rollback migrations after all tests complete
    await testDb.migrate.rollback();
    await testDb.destroy();
  });

  it('updates an existing post in the database', async () => {
    // Mock post data to update
    const existingPostId = 84; // Ensure this ID exists in your test seed data
    const updates: Partial<Post> = {
      title: 'Updated Title',
      content: 'Updated content.',
      updated_by: 'User456', // Assuming updated_by is a field in your interface
    };

    // Call the update method and await the result
    const updatedPost: Post | null = await PostModel.update(existingPostId, updates);

    // Assert that the returned post matches the expected structure
    expect(updatedPost).not.toBeNull();
    if (updatedPost) {
      expect(updatedPost.id).toEqual(existingPostId);
      expect(updatedPost.title).toEqual(updates.title);
      expect(updatedPost.content).toEqual(updates.content);
      expect(updatedPost.updated_by).toEqual(updates.updated_by);
      expect(updatedPost).toHaveProperty('updated_at');
    }
  });

  it('returns null when trying to update a non-existing post', async () => {
    // Mock post data to update
    const nonExistingPostId = 9999; // Ensure this ID does not exist in your test data
    const updates: Partial<Post> = {
      title: 'Updated Title',
      content: 'Updated content.',
      updated_by: 'User456', // Assuming updated_by is a field in your interface
    };

    // Call the update method and await the result
    const updatedPost: Post | null = await PostModel.update(nonExistingPostId, updates);

    // Assert that the result is null
    expect(updatedPost).toBeNull();
  });

  // Add more test cases as needed
});
