import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { User, Post } from '/Users/ananyamishra/Desktop/post_app4/src/interfaces.ts';
import knex from 'knex';
import knexConfig from '../knexfile';
import { verifyToken, generateToken } from '/Users/ananyamishra/Desktop/post_app4/src/middleware.ts';
import PostModel from '/Users/ananyamishra/Desktop/post_app4/src/models/Posts.ts';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const app = express();
const db = knex(knexConfig.development);
const JWT_SECRET = process.env.JWT_SECRET;

app.use(bodyParser.json());
app.use(cors());

app.post('/posts', verifyToken, async (req: express.Request, res: express.Response) => {
    try {
        const { title, content, created_by }: Post = req.body;
        const newPost = await PostModel.create({ title, content, created_by });
        res.json(newPost);
    } catch (error) {
        console.error('Error adding post:', error);
        res.status(500).json({ success: false, error: 'Failed to add post' });
    }
});

app.put('/posts/:id', verifyToken, async (req: express.Request, res: express.Response) => {
    const { id } = req.params;
    const { title, content, updated_by }: Partial<Post> = req.body;

    try {
        const updatedPost = await PostModel.update(Number(id), { title, content, updated_by });
        if (!updatedPost) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }
        res.json(updatedPost);
    } catch (error) {
        console.error('Error editing post:', error);
        res.status(500).json({ success: false, error: 'Failed to edit post' });
    }
});

app.delete('/posts/:id', verifyToken, async (req: express.Request, res: express.Response) => {
    const { id } = req.params;
    try {
        const deleted = await PostModel.delete(Number(id));
        if (!deleted) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }
        const posts = await PostModel.getAll();
        res.json(posts);
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ success: false, error: 'Failed to delete post' });
    }
});

app.get('/posts', async (req: express.Request, res: express.Response) => {
    try {
        const posts = await PostModel.getAll();
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

app.post('/register', async (req: express.Request, res: express.Response) => {
    const { username, password }: User = req.body;

    try {
        const hashedPassword: string = await bcrypt.hash(password, 10);
        const [newUser]: User[] = await db('test_users').insert({ username, password: hashedPassword }).returning('*');
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ success: false, error: 'Failed to register user' });
    }
});

app.post('/login', async (req: express.Request, res: express.Response) => {
    const { username, password }: Pick<User, 'username' | 'password'> = req.body;

    try {
        const user: User | undefined = await db('test_users').where({ username }).first();
        if (!user) {
            return res.status(400).json({ success: false, error: 'Invalid username or password' });
        }

        const isPasswordValid: boolean = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, error: 'Invalid username or password' });
        }

        const token: string = generateToken(user);

        console.log('Login successful for user:', username);
        res.status(200).json({ token });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ success: false, error: 'Failed to log in user' });
    }
});

describe('API Endpoints', () => {
    it('should register a new user', async () => {
        const res = await request(app)
            .post('/register')
            .send({ username: 'testuser75', password: 'testpassword' });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
    });

    it('should login an existing user', async () => {
        const res = await request(app)
            .post('/login')
            .send({ username: 'testuser75', password: 'testpassword' });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
    });

    it('should create a new post', async () => {
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTcsInVzZXJuYW1lIjoibmV3IiwiaWF0IjoxNzE4Nzg4MDk0LCJleHAiOjE3MTg3OTE2OTR9.CsKHvH6puHQtYuW6MqMklbZLgrTqDNivEwpQ5aFqD-w'; // replace with a valid token
        const res = await request(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'New Post', content: 'This is a new post', created_by: "new author" });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('id');
    });

    it('should get all posts', async () => {
        const res = await request(app).get('/posts');
        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Array);
    });

    it('should update a post', async () => {
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTcsInVzZXJuYW1lIjoibmV3IiwiaWF0IjoxNzE4Nzg4MDk0LCJleHAiOjE3MTg3OTE2OTR9.CsKHvH6puHQtYuW6MqMklbZLgrTqDNivEwpQ5aFqD-w'; // replace with a valid token
        const res = await request(app)
            .put('/posts/85')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Updated Post', content: 'Updated content', updated_by: 'new' });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('title', 'Updated Post');
    });


    it('should return 404 if post is not found', async () => {
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTcsInVzZXJuYW1lIjoibmV3IiwiaWF0IjoxNzE4Nzg4MDk0LCJleHAiOjE3MTg3OTE2OTR9.CsKHvH6puHQtYuW6MqMklbZLgrTqDNivEwpQ5aFqD-w'; // replace with a valid token

        const res = await request(app)
            .delete('/posts/9999')  
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ success: false, error: 'Post not found' });
    });


    
  
});
