"use strict";
// src/server.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const middleware_1 = require("./middleware"); // Import middleware classes and db instance from middleware.ts
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
console.log(process.env.SECRET_KEY);
// Define a route to add a new post
app.post('/posts', middleware_1.AuthMiddleware.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, content, created_by } = req.body;
    try {
        const [newPost] = yield (0, middleware_1.db)('posts').insert({ title, content, created_by }).returning('*');
        res.json(newPost);
    }
    catch (error) {
        console.error('Error adding post:', error);
        res.status(500).json({ error: 'Failed to add post' });
    }
}));
// Define a route to edit a post
app.put('/posts/:id', middleware_1.AuthMiddleware.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { title, content, updated_by } = req.body;
    try {
        const postExists = yield (0, middleware_1.db)('posts').where({ id }).first();
        if (!postExists) {
            return res.status(404).json({ error: 'Post not found' });
        }
        const [updatedPost] = yield (0, middleware_1.db)('posts')
            .where({ id })
            .update({
            title,
            content,
            updated_by,
            updated_at: middleware_1.db.fn.now(),
        })
            .returning('*');
        res.json(updatedPost);
    }
    catch (error) {
        console.error('Error editing post:', error);
        res.status(500).json({ error: 'Failed to edit post' });
    }
}));
// Define a route to delete a post
app.delete('/posts/:id', middleware_1.AuthMiddleware.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const deletedCount = yield (0, middleware_1.db)('posts').where({ id }).update({ is_deleted: true });
        if (deletedCount === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }
        const posts = yield (0, middleware_1.db)('posts').where({ is_deleted: false }).select('*');
        res.json(posts);
    }
    catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
}));
// Define a route to get all posts
app.get('/posts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield (0, middleware_1.db)('posts').select('*');
        const modifiedPosts = posts.map(post => (Object.assign(Object.assign({}, post), { updated_at: post.updated_at === post.created_at ? '' : post.updated_at })));
        res.json(modifiedPosts);
    }
    catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
}));
// Define a route to register a new user
app.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        console.log('Received username:', username);
        console.log('Received password:', password);
        const hashedPassword = yield middleware_1.AuthUtils.hashPassword(password);
        console.log('Hashed Password:', hashedPassword);
        const [newUser] = yield (0, middleware_1.db)('users').insert({ username, password: hashedPassword }).returning('*');
        console.log('New User:', newUser);
        res.status(201).json(newUser);
    }
    catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
}));
// Define a route to handle user login
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        const user = yield (0, middleware_1.db)('users').where({ username }).first();
        if (!user) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }
        const token = yield middleware_1.AuthUtils.generateToken(user);
        console.log('Login successful for user:', username);
        res.status(200).json({ token });
    }
    catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: 'Failed to log in user' });
    }
}));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
