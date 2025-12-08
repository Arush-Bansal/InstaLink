import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILink {
  title: string;
  url: string;
  icon?: string;
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
  pinterest?: string;
  github?: string;
  email?: string;
}

export interface IUser {
  _id?: mongoose.Types.ObjectId;
  username?: string;
  email: string;
  title?: string;
  bio?: string;
  image?: string;
  links?: ILink[];
  storeItems?: IStoreItem[];
  socialLinks?: ISocialLinks;
  themeColor?: string;
  outfits?: IOutfit[];
  createdAt?: Date;
  password?: string;
}

export interface IOutfitItem {
  id: string;
  title: string;
  url: string;
  x: number;
  y: number;
}

export interface IOutfit {
  id: string;
  image: string;
  items: IOutfitItem[];
}

const LinkSchema = new Schema<ILink>({
  title: { type: String, required: true },
  url: { type: String, required: true },
  icon: { type: String, default: 'Globe' },
  clicks: { type: Number, default: 0 },
});

const StoreItemSchema = new Schema<IStoreItem>({
  title: { type: String, required: true },
  price: { type: String, required: true },
  image: { type: String, default: '' },
  url: { type: String, default: '#' },
  clicks: { type: Number, default: 0 },
});

const OutfitItemSchema = new Schema<IOutfitItem>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
});

const OutfitSchema = new Schema<IOutfit>({
  id: { type: String, required: true },
  image: { type: String, required: true },
  items: { type: [OutfitItemSchema], default: [] },
});

const UserSchema = new Schema<IUser>({
  username: { type: String, required: false, unique: true, index: true, sparse: true }, // Username is optional initially (until onboarding)
  email: { type: String, required: true, unique: true, index: true },
  title: { type: String, default: 'My Profile' },
  bio: { type: String, default: '' },
  image: { type: String, default: '' },
  links: { type: [LinkSchema], default: [] },
  storeItems: { type: [StoreItemSchema], default: [] },
  outfits: { type: [OutfitSchema], default: [] },
  socialLinks: {
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    youtube: { type: String, default: '' },
    facebook: { type: String, default: '' },
    pinterest: { type: String, default: '' },
    github: { type: String, default: '' },
    email: { type: String, default: '' },
  },
  themeColor: { type: String, default: 'indigo' },
  createdAt: { type: Date, default: Date.now },
  password: { type: String, select: false },
});

// Prevent model overwrite in development
// Force model rebuild if schema changed
if (mongoose.models.User) {
  delete mongoose.models.User;
}
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
