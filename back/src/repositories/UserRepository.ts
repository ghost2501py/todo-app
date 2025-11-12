import UserModel, { IUserDocument } from '../models/User.model';
import { IUser, CreateUserDTO } from '../types/user.types';

export class UserRepository {
  async findByAuth0Id(auth0Id: string): Promise<IUser | null> {
    const user = await UserModel.findOne({ auth0_id: auth0Id });
    return user ? this.toJSON(user) : null;
  }

  async create(data: CreateUserDTO): Promise<IUser> {
    const user = new UserModel(data);
    const savedUser = await user.save();
    return this.toJSON(savedUser);
  }

  async findOrCreate(auth0Id: string, email: string, name: string): Promise<IUser> {
    let user = await this.findByAuth0Id(auth0Id);

    if (!user) {
      user = await this.create({ auth0_id: auth0Id, email, name });
    }

    return user;
  }

  private toJSON(user: IUserDocument): IUser {
    return {
      _id: (user._id as any).toString(),
      auth0_id: user.auth0_id,
      email: user.email,
      name: user.name,
      created_at: user.created_at
    };
  }
}

