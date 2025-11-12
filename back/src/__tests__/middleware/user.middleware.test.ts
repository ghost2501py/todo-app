import { Request, Response, NextFunction } from 'express';
import { UserService } from '../../services/UserService';

const mockFindOrCreateUser = jest.fn();

jest.mock('../../services/UserService', () => {
  return {
    UserService: jest.fn().mockImplementation(() => {
      return {
        findOrCreateUser: mockFindOrCreateUser
      };
    })
  };
});

import { ensureUserExists } from '../../middleware/user.middleware';

describe('User Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let responseJson: jest.Mock;
  let responseStatus: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    responseJson = jest.fn().mockReturnThis();
    responseStatus = jest.fn().mockReturnThis();

    mockResponse = {
      json: responseJson,
      status: responseStatus
    };

    mockNext = jest.fn();
    
    mockFindOrCreateUser.mockResolvedValue(undefined);
  });

  describe('ensureUserExists', () => {
    it('should attach userId to request and call next when auth is valid', async () => {
      mockRequest = {
        auth: {
          payload: {
            sub: 'auth0|123456',
            email: 'test@example.com',
            name: 'Test User'
          }
        } as any
      };

      await ensureUserExists(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.userId).toBe('auth0|123456');
      expect(mockNext).toHaveBeenCalled();
      expect(responseStatus).not.toHaveBeenCalled();
    });

    it('should return 401 if auth payload is missing', async () => {
      mockRequest = {
        auth: undefined
      };

      await ensureUserExists(mockRequest as Request, mockResponse as Response, mockNext);

      expect(responseStatus).toHaveBeenCalledWith(401);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Unauthorized' });
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRequest.userId).toBeUndefined();
    });

    it('should return 401 if auth.payload.sub is missing', async () => {
      mockRequest = {
        auth: {
          payload: {}
        } as any
      };

      await ensureUserExists(mockRequest as Request, mockResponse as Response, mockNext);

      expect(responseStatus).toHaveBeenCalledWith(401);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Unauthorized' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call findOrCreateUser with correct parameters', async () => {
      mockRequest = {
        auth: {
          payload: {
            sub: 'auth0|123456',
            email: 'test@example.com',
            name: 'Test User'
          }
        } as any
      };

      await ensureUserExists(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockFindOrCreateUser).toHaveBeenCalledWith(
        'auth0|123456',
        'test@example.com',
        'Test User'
      );
    });

    it('should use default email if not provided', async () => {
      mockRequest = {
        auth: {
          payload: {
            sub: 'auth0|123456',
            name: 'Test User'
          }
        } as any
      };

      await ensureUserExists(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockFindOrCreateUser).toHaveBeenCalledWith(
        'auth0|123456',
        'unknown@example.com',
        'Test User'
      );
    });

    it('should use default name if not provided', async () => {
      mockRequest = {
        auth: {
          payload: {
            sub: 'auth0|123456',
            email: 'test@example.com'
          }
        } as any
      };

      await ensureUserExists(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockFindOrCreateUser).toHaveBeenCalledWith(
        'auth0|123456',
        'test@example.com',
        'Unknown User'
      );
    });

    it('should call next with error if service throws', async () => {
      const error = new Error('Database error');
      mockFindOrCreateUser.mockRejectedValue(error);

      mockRequest = {
        auth: {
          payload: {
            sub: 'auth0|123456',
            email: 'test@example.com',
            name: 'Test User'
          }
        } as any
      };

      await ensureUserExists(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});

