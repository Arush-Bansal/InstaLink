import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILink {
  title: string;
  url: string;
}

export interface IStoreItem {
  title: string;
  price: string;
  image: string;
  url: string;
}

export interface IUser extends Document {
  username: string;
  title: string;
  bio: string;
  image: string;
  links: ILink[];
  storeItems: IStoreItem[];
  themeColor: string;
  createdAt: Date;
}

const LinkSchema = new Schema<ILink>({
  title: { type: String, required: true },
  url: { type: String, required: true },
});

const StoreItemSchema = new Schema<IStoreItem>({
  title: { type: String, required: true },
  price: { type: String, required: true },
  image: { type: String, default: '' },
  url: { type: String, default: '#' },
});

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true, index: true },
  title: { type: String, default: 'My Profile' },
  bio: { type: String, default: '' },
  image: { type: String, default: '' },
  links: { type: [LinkSchema], default: [] },
  storeItems: { type: [StoreItemSchema], default: [] },
  themeColor: { type: String, default: 'indigo' },
  createdAt: { type: Date, default: Date.now },
});

// Prevent model overwrite in development
// Force model rebuild if schema changed
if (mongoose.models.User) {
  delete mongoose.models.User;
}
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
