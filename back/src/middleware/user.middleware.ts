import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';

const userService = new UserService();

export const ensureUserExists = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth0Id = req.auth?.payload.sub as string | undefined;
    const email = (req.auth?.payload.email as string | undefined) || 'unknown@example.com';
    const name = (req.auth?.payload.name as string | undefined) || 'Unknown User';

    if (!auth0Id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await userService.findOrCreateUser(auth0Id, email, name);
    req.userId = auth0Id;
    next();
  } catch (error) {
    next(error);
  }
};

