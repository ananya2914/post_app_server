import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import knex from 'knex';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import knexConfig from './knexfile';
import { User, Post } from './interfaces';
import { verifyToken, generateToken } from './middleware';
import PostModel from './models/Posts';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const db = knex(knexConfig.development);
const JWT_SECRET = process.env.JWT_SECRET;

app.use(bodyParser.json());
app.use(cors());

// Define a route to add a new post
app.post('/posts', verifyToken, async (req: Request, res: Response) => {
    try {
        const { title, content, created_by }: Post = req.body;
        const newPost = await PostModel.create({ title, content, created_by });
        res.json(newPost);
    } catch (error) {
        console.error('Error adding post:', error);
        res.status(500).json({ success: false, error: 'Failed to add post' });
    }
});

// Route to edit a post
app.put('/posts/:id', verifyToken, async (req: Request, res: Response) => {
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

// Route to delete a post
app.delete('/posts/:id', verifyToken, async (req: Request, res: Response) => {
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

// Route to get all posts
app.get('/posts', async (req: Request, res: Response) => {
    try {
        const posts = await PostModel.getAll();
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// Route to register a new user
app.post('/register', async (req: Request, res: Response) => {
    const { username, password }: User = req.body;

    try {
        const hashedPassword: string = await bcrypt.hash(password, 10);

        const [newUser]: User[] = await db('users').insert({ username, password: hashedPassword }).returning('*');

        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ success: false, error: 'Failed to register user' });
    }
});

// Route to log in user
app.post('/login', async (req: Request, res: Response) => {
    const { username, password }: Pick<User, 'username' | 'password'> = req.body;

    try {
        const user: User | undefined = await db('users').where({ username }).first();
        
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
