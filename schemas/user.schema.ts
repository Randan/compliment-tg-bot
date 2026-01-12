import mongoose, { Schema } from 'mongoose';
import { dbUsersCollection } from '../utils';
import type { IUser } from '../interfaces';

const userSchema = new Schema<IUser>({
  telegramId: Number,
  firstName: String,
  lastName: {
    type: String,
    default: undefined,
  },
  userName: {
    type: String,
    default: undefined,
  },
});

const Users = mongoose.model(dbUsersCollection, userSchema);

export default Users;
