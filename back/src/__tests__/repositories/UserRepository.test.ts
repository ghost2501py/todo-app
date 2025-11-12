import { UserRepository } from '../../repositories/UserRepository';
import UserModel from '../../models/User.model';
import { CreateUserDTO } from '../../types/user.types';

// Mock the UserModel
jest.mock('../../models/User.model');

describe('UserRepository', () => {
  let userRepository: UserRepository;

  beforeEach(() => {
    userRepository = new UserRepository();
    jest.clearAllMocks();
  });

  describe('findByAuth0Id', () => {
    it('should find user by auth0 id', async () => {
      const auth0Id = 'auth0|123456';
      const mockUser = {
        _id: '1',
        auth0_id: auth0Id,
        email: 'test@example.com',
        name: 'Test User',
        created_at: new Date()
      };

      (UserModel.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await userRepository.findByAuth0Id(auth0Id);

      expect(UserModel.findOne).toHaveBeenCalledWith({ auth0_id: auth0Id });
      expect(result).not.toBeNull();
      expect(result?.auth0_id).toBe(auth0Id);
      expect(result?.email).toBe('test@example.com');
    });

    it('should return null if user not found', async () => {
      const auth0Id = 'auth0|nonexistent';

      (UserModel.findOne as jest.Mock).mockResolvedValue(null);

      const result = await userRepository.findByAuth0Id(auth0Id);

      expect(UserModel.findOne).toHaveBeenCalledWith({ auth0_id: auth0Id });
      expect(result).toBeNull();
    });

    it('should handle different auth0 provider formats', async () => {
      const googleAuth0Id = 'google-oauth2|123456';
      const mockUser = {
        _id: '2',
        auth0_id: googleAuth0Id,
        email: 'google@example.com',
        name: 'Google User',
        created_at: new Date()
      };

      (UserModel.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await userRepository.findByAuth0Id(googleAuth0Id);

      expect(result?.auth0_id).toBe(googleAuth0Id);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const userData: CreateUserDTO = {
        auth0_id: 'auth0|123456',
        email: 'newuser@example.com',
        name: 'New User'
      };

      const mockSavedUser = {
        _id: '1',
        ...userData,
        created_at: new Date(),
        save: jest.fn()
      };

      const mockSave = jest.fn().mockResolvedValue(mockSavedUser);
      mockSavedUser.save = mockSave;

      (UserModel as any).mockImplementation(() => mockSavedUser);

      const result = await userRepository.create(userData);

      expect(result.auth0_id).toBe(userData.auth0_id);
      expect(result.email).toBe(userData.email);
      expect(result.name).toBe(userData.name);
      expect(mockSave).toHaveBeenCalled();
    });

    it('should create user with all required fields', async () => {
      const userData: CreateUserDTO = {
        auth0_id: 'auth0|654321',
        email: 'test@example.com',
        name: 'Test User'
      };

      const mockSavedUser = {
        _id: '2',
        ...userData,
        created_at: new Date(),
        save: jest.fn()
      };

      mockSavedUser.save.mockResolvedValue(mockSavedUser);
      (UserModel as any).mockImplementation(() => mockSavedUser);

      const result = await userRepository.create(userData);

      expect(result).toHaveProperty('_id');
      expect(result).toHaveProperty('auth0_id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('created_at');
    });

    it('should handle creation errors', async () => {
      const userData: CreateUserDTO = {
        auth0_id: 'auth0|123',
        email: 'test@example.com',
        name: 'Test'
      };

      const error = new Error('Validation error');
      (UserModel as any).mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(error)
      }));

      await expect(userRepository.create(userData)).rejects.toThrow('Validation error');
    });
  });

  describe('findOrCreate', () => {
    it('should return existing user if found', async () => {
      const auth0Id = 'auth0|123456';
      const email = 'existing@example.com';
      const name = 'Existing User';

      const existingUser = {
        _id: '1',
        auth0_id: auth0Id,
        email,
        name,
        created_at: new Date()
      };

      (UserModel.findOne as jest.Mock).mockResolvedValue(existingUser);

      const result = await userRepository.findOrCreate(auth0Id, email, name);

      expect(UserModel.findOne).toHaveBeenCalledWith({ auth0_id: auth0Id });
      expect(result._id).toBe('1');
      expect(result.email).toBe(email);
    });

    it('should create new user if not found', async () => {
      const auth0Id = 'auth0|654321';
      const email = 'newuser@example.com';
      const name = 'New User';

      (UserModel.findOne as jest.Mock).mockResolvedValue(null);

      const mockSavedUser = {
        _id: '2',
        auth0_id: auth0Id,
        email,
        name,
        created_at: new Date(),
        save: jest.fn()
      };

      mockSavedUser.save.mockResolvedValue(mockSavedUser);
      (UserModel as any).mockImplementation(() => mockSavedUser);

      const result = await userRepository.findOrCreate(auth0Id, email, name);

      expect(UserModel.findOne).toHaveBeenCalledWith({ auth0_id: auth0Id });
      expect(result.auth0_id).toBe(auth0Id);
      expect(result.email).toBe(email);
      expect(result.name).toBe(name);
    });

    it('should call findByAuth0Id and create in sequence', async () => {
      const auth0Id = 'auth0|999';
      const email = 'test@example.com';
      const name = 'Test';

      (UserModel.findOne as jest.Mock).mockResolvedValue(null);

      const mockSavedUser = {
        _id: '3',
        auth0_id: auth0Id,
        email,
        name,
        created_at: new Date(),
        save: jest.fn()
      };

      mockSavedUser.save.mockResolvedValue(mockSavedUser);
      (UserModel as any).mockImplementation(() => mockSavedUser);

      await userRepository.findOrCreate(auth0Id, email, name);

      expect(UserModel.findOne).toHaveBeenCalledTimes(1);
      expect(UserModel).toHaveBeenCalledTimes(1);
    });

    it('should not create duplicate users', async () => {
      const auth0Id = 'auth0|123';
      const email = 'test@example.com';
      const name = 'Test';

      const existingUser = {
        _id: '1',
        auth0_id: auth0Id,
        email,
        name,
        created_at: new Date()
      };

      (UserModel.findOne as jest.Mock).mockResolvedValue(existingUser);

      await userRepository.findOrCreate(auth0Id, email, name);

      // Should not call UserModel constructor since user exists
      expect(UserModel).not.toHaveBeenCalled();
    });
  });
});

