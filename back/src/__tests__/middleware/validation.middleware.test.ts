import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validateRequest } from '../../middleware/validation.middleware';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let responseJson: jest.Mock;
  let responseStatus: jest.Mock;

  beforeEach(() => {
    responseJson = jest.fn().mockReturnThis();
    responseStatus = jest.fn().mockReturnThis();

    mockRequest = {
      body: {}
    };

    mockResponse = {
      json: responseJson,
      status: responseStatus
    };

    mockNext = jest.fn();
  });

  describe('validateRequest', () => {
    it('should call next() if validation passes', async () => {
      const schema = z.object({
        name: z.string(),
        age: z.number()
      });

      mockRequest.body = {
        name: 'John',
        age: 30
      };

      const middleware = validateRequest(schema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(responseStatus).not.toHaveBeenCalled();
      expect(responseJson).not.toHaveBeenCalled();
    });

    it('should return 400 if validation fails', async () => {
      const schema = z.object({
        name: z.string(),
        age: z.number()
      });

      mockRequest.body = {
        name: 'John',
        age: 'invalid' // Should be number
      };

      const middleware = validateRequest(schema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation failed'
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      const schema = z.object({
        title: z.string().min(1),
        description: z.string().min(1)
      });

      mockRequest.body = {
        title: ''
      };

      const middleware = validateRequest(schema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation failed',
          details: expect.anything()
        })
      );
    });

    it('should validate string length constraints', async () => {
      const schema = z.object({
        title: z.string().max(10)
      });

      mockRequest.body = {
        title: 'This is a very long title that exceeds the maximum length'
      };

      const middleware = validateRequest(schema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation failed'
        })
      );
    });

    it('should validate enum values', async () => {
      const schema = z.object({
        status: z.enum(['pending', 'completed'])
      });

      mockRequest.body = {
        status: 'invalid-status'
      };

      const middleware = validateRequest(schema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation failed'
        })
      );
    });

    it('should pass with valid enum value', async () => {
      const schema = z.object({
        status: z.enum(['pending', 'completed'])
      });

      mockRequest.body = {
        status: 'completed'
      };

      const middleware = validateRequest(schema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should validate optional fields', async () => {
      const schema = z.object({
        title: z.string().optional(),
        description: z.string()
      });

      mockRequest.body = {
        description: 'Description only'
      };

      const middleware = validateRequest(schema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should trim strings when specified', async () => {
      const schema = z.object({
        title: z.string().trim().min(1)
      });

      mockRequest.body = {
        title: '   '
      };

      const middleware = validateRequest(schema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(responseStatus).toHaveBeenCalledWith(400);
    });

    it('should accept trimmed non-empty strings', async () => {
      const schema = z.object({
        title: z.string().trim().min(1)
      });

      mockRequest.body = {
        title: '  Valid Title  '
      };

      const middleware = validateRequest(schema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should validate nested objects', async () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          email: z.string().email()
        })
      });

      mockRequest.body = {
        user: {
          name: 'John',
          email: 'invalid-email'
        }
      };

      const middleware = validateRequest(schema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(responseStatus).toHaveBeenCalledWith(400);
    });

    it('should validate arrays', async () => {
      const schema = z.object({
        tags: z.array(z.string()).min(1)
      });

      mockRequest.body = {
        tags: []
      };

      const middleware = validateRequest(schema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(responseStatus).toHaveBeenCalledWith(400);
    });

    it('should include validation error details', async () => {
      const schema = z.object({
        age: z.number().min(18)
      });

      mockRequest.body = {
        age: 15
      };

      const middleware = validateRequest(schema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation failed',
          details: expect.any(Array)
        })
      );
    });
  });
});

