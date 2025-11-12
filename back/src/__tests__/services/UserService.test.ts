import { UserService } from '../../services/UserService';
import { UserRepository } from '../../repositories/UserRepository';
import { IUser } from '../../types/user.types';

// Mock UserRepository
jest.mock('../../repositories/UserRepository');

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
    userService = new UserService();
    (userService as any).userRepository = mockUserRepository;
  });

  describe('findOrCreateUser', () => {
    it('should find existing user', async () => {
      const auth0Id = 'auth0|123456';
      const email = 'test@example.com';
      const name = 'Test User';

      const existingUser: IUser = {
        _id: '1',
        auth0_id: auth0Id,
        email,
        name,
        created_at: new Date()
      };

      mockUserRepository.findOrCreate.mockResolvedValue(existingUser);

      const result = await userService.findOrCreateUser(auth0Id, email, name);

      expect(mockUserRepository.findOrCreate).toHaveBeenCalledWith(auth0Id, email, name);
      expect(result).toEqual(existingUser);
      expect(result._id).toBe('1');
    });

    it('should create new user if not found', async () => {
      const auth0Id = 'auth0|654321';
      const email = 'newuser@example.com';
      const name = 'New User';

      const newUser: IUser = {
        _id: '2',
        auth0_id: auth0Id,
        email,
        name,
        created_at: new Date()
      };

      mockUserRepository.findOrCreate.mockResolvedValue(newUser);

      const result = await userService.findOrCreateUser(auth0Id, email, name);

      expect(mockUserRepository.findOrCreate).toHaveBeenCalledWith(auth0Id, email, name);
      expect(result).toEqual(newUser);
      expect(result.email).toBe(email);
      expect(result.name).toBe(name);
    });

    it('should handle different auth0 providers', async () => {
      const googleAuth0Id = 'google-oauth2|123456';
      const email = 'google@example.com';
      const name = 'Google User';

      const user: IUser = {
        _id: '3',
        auth0_id: googleAuth0Id,
        email,
        name,
        created_at: new Date()
      };

      mockUserRepository.findOrCreate.mockResolvedValue(user);

      const result = await userService.findOrCreateUser(googleAuth0Id, email, name);

      expect(result.auth0_id).toBe(googleAuth0Id);
    });

    it('should propagate repository errors', async () => {
      const auth0Id = 'auth0|123';
      const email = 'test@example.com';
      const name = 'Test';
      const error = new Error('Database error');

      mockUserRepository.findOrCreate.mockRejectedValue(error);

      await expect(userService.findOrCreateUser(auth0Id, email, name)).rejects.toThrow('Database error');
    });
  });

  describe('getUserByAuth0Id', () => {
    it('should return user by auth0 id', async () => {
      const auth0Id = 'auth0|123456';
      const mockUser: IUser = {
        _id: '1',
        auth0_id: auth0Id,
        email: 'test@example.com',
        name: 'Test User',
        created_at: new Date()
      };

      mockUserRepository.findByAuth0Id.mockResolvedValue(mockUser);

      const result = await userService.getUserByAuth0Id(auth0Id);

      expect(mockUserRepository.findByAuth0Id).toHaveBeenCalledWith(auth0Id);
      expect(result).toEqual(mockUser);
      expect(result?.auth0_id).toBe(auth0Id);
    });

    it('should return null if user not found', async () => {
      const auth0Id = 'auth0|nonexistent';

      mockUserRepository.findByAuth0Id.mockResolvedValue(null);

      const result = await userService.getUserByAuth0Id(auth0Id);

      expect(mockUserRepository.findByAuth0Id).toHaveBeenCalledWith(auth0Id);
      expect(result).toBeNull();
    });

    it('should propagate repository errors', async () => {
      const auth0Id = 'auth0|123';
      const error = new Error('Database error');

      mockUserRepository.findByAuth0Id.mockRejectedValue(error);

      await expect(userService.getUserByAuth0Id(auth0Id)).rejects.toThrow('Database error');
    });
  });
});

