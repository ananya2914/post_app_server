import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User } from './interfaces';

const JWT_SECRET = "39d261efc4560ba806772d2af2ea25feb8e9a3ad0407458d898443764ded78c854c182c54023fc1f7fda57be97baf770c125e2a9c7d2089f9fdad55a154dbbe3";

export const generateToken = (user: User): string => {
    return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
};

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(403).json({ success: false, error: 'No token provided' });
    }
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(500).json({ success: false, error: 'Failed to authenticate token' });
        }
        req.body.userId = (decoded as any).id;
        next();
    });
};
