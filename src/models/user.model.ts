import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// 1. Create an interface representing a document in MongoDB.
export interface User {
  _id: mongoose.Types.ObjectId;
  email: string;
  name: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  admin: boolean;
}

// 2. Create a Schema corresponding to the document interface.
const userSchema = new mongoose.Schema<User>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    admin: { type: Boolean, required: true },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function () {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.pre('updateOne', async function () {
  const data = this.getChanges();
  const salt = await bcrypt.genSalt();
  data.password = await bcrypt.hash(data.password, salt);
});

// 3. Create a Model.
const UserModel = mongoose.model<User>('User', userSchema);

export default UserModel;
