import { UserRepository } from '../repositories/UserRepository';
import { IUser } from '../types/user.types';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async findOrCreateUser(auth0Id: string, email: string, name: string): Promise<IUser> {
    return await this.userRepository.findOrCreate(auth0Id, email, name);
  }

  async getUserByAuth0Id(auth0Id: string): Promise<IUser | null> {
    return await this.userRepository.findByAuth0Id(auth0Id);
  }
}

