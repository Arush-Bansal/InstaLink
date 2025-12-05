import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILink {
  title: string;
  url: string;
  clicks?: number;
  _id?: string;
}

export interface IStoreItem {
  title: string;
  price: string;
  image: string;
  url: string;
  clicks?: number;
  _id?: string;
}

export interface ISocialLinks {
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  facebook?: string;
  tiktok?: string;
  github?: string;
}

export interface IUser extends Document {
  username?: string;
  email: string;
  title: string;
  bio: string;
  image: string;
  links: ILink[];
  storeItems: IStoreItem[];
  socialLinks?: ISocialLinks;
  themeColor: string;
  createdAt: Date;
}

const LinkSchema = new Schema<ILink>({
  title: { type: String, required: true },
  url: { type: String, required: true },
  clicks: { type: Number, default: 0 },
});

const StoreItemSchema = new Schema<IStoreItem>({
  title: { type: String, required: true },
  price: { type: String, required: true },
  image: { type: String, default: '' },
  url: { type: String, default: '#' },
  clicks: { type: Number, default: 0 },
});

const UserSchema = new Schema<IUser>({
  username: { type: String, required: false, unique: true, index: true, sparse: true }, // Username is optional initially (until onboarding)
  email: { type: String, required: true, unique: true, index: true },
  title: { type: String, default: 'My Profile' },
  bio: { type: String, default: '' },
  image: { type: String, default: '' },
  links: { type: [LinkSchema], default: [] },
  storeItems: { type: [StoreItemSchema], default: [] },
  socialLinks: {
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    youtube: { type: String, default: '' },
    facebook: { type: String, default: '' },
    tiktok: { type: String, default: '' },
    github: { type: String, default: '' },
  },
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
