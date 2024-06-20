import knex from 'knex';
import knexConfig from '../knexfile';
import { Post } from '../interfaces';

const db = knex(knexConfig.development);

class PostModel {
    async create(post: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'is_deleted'>): Promise<Post> {
        if (!post.title || !post.content || !post.created_by) {
            throw new Error('Missing required fields: title, content, created_by');
        }

        // Insert new post into the database
        const [newPost] = await db('test_posts').insert({
            ...post,
            created_at: new Date(),
            updated_at: new Date(),
            is_deleted: false,
        }).returning('*');

        return newPost;
      }
    async update(id: number, updates: Partial<Post>): Promise<Post | null> {
        const [updatedPost] = await db('test_posts')
            .where({ id })
            .update({ ...updates, updated_at: new Date() })
            .returning('*');
        return updatedPost || null;
    }

    async delete(id: number): Promise<boolean> {
        const deletedCount = await db('test_posts').where({ id }).update({ is_deleted: true, updated_at: new Date() });
        return deletedCount > 0;
    }

    async getAll(): Promise<Post[]> {
        const posts = await db('test_posts').where({ is_deleted: false }).select('*');
        return posts.map(post => ({
            ...post,
            updated_at: typeof post.updated_at === 'string' ? new Date(post.updated_at) : post.updated_at,
        }));
    }

    async getById(id: number): Promise<Post | null> {
        const post = await db('test_posts').where({ id, is_deleted: false }).first();
        return post || null;
    }
     
}

export default new PostModel();
