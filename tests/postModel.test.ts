// tests/postModel.test.ts

import { Knex } from 'knex';
import knexConfig from '../knexfile'; // Adjust path as necessary
import PostModel from '../src/models/Posts'; // Adjust path as necessary
import { Post } from '/Users/ananyamishra/Desktop/post_app4/src/interfaces'; // Adjust path as necessary
import { afterAll, beforeEach, describe, expect, it } from '@jest/globals';

// Test database setup using Knex with PostgreSQL
const testDb: Knex = require('knex')(knexConfig.test);


describe('PostModel', () => {
  it('creates a new post', async () => {
    // Mock post data
    const mockPost: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'is_deleted'> = {
      title: 'Test Post',
      content: 'This is a test post.',
      created_by: 'User123', // Assuming created_by is a string in your interface
    };

    // Call the create method and await the result
    const createdPost: Post = await PostModel.create(mockPost);

    // Assert that the returned post matches the expected structure
    expect(createdPost).toHaveProperty('id');
    expect(createdPost.title).toEqual(mockPost.title);
    expect(createdPost.content).toEqual(mockPost.content);
    expect(createdPost.created_by).toEqual(mockPost.created_by);
    expect(createdPost).toHaveProperty('created_at');
    expect(createdPost).toHaveProperty('updated_at');
    expect(createdPost.is_deleted).toEqual(false);
  });

  // Add more test cases as needed
});
