import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";


const DEFAULT_PROFILE_IMAGE = "https://images.unsplash.com/photo-1503220317375-aaad6143d41b?w=400&h=400&fit=crop";

export const DEFAULT_USER_DATA = {
  bio: "Travel & Adventure Creator 🇮🇳 | Exploring the world one city at a time",
  links: [
    { title: "My Travel Blog", url: "https://example.com/blog", icon: "Globe" },
    { title: "Best Flight Deals", url: "https://skyscanner.com", icon: "Plane" },
    { title: "Latest Vlog: Bali", url: "https://youtube.com", icon: "Youtube" }
  ],
  trips: [
    {
      id: "trip_1",
      title: "Bali 2024 🌴",
      date: "August 2024",
      items: [
        { id: "item_1", type: "header", title: "Day 1: Seminyak Arrival" },
        { id: "item_2", type: "link", title: "Potato Head Beach Club", url: "https://potatohead.co" },
        { id: "item_3", type: "link", title: "W Hotel Seminyak", url: "https://marriott.com" },
        { id: "item_4", type: "header", title: "Day 2: Ubud Vibes" },
        { id: "item_5", type: "link", title: "Sacred Monkey Forest", url: "https://monkeyforestubud.com" }
      ]
    }
  ],
  socialLinks: {
    instagram: "https://instagram.com",
    pinterest: "https://pinterest.com",
    youtube: "https://youtube.com"
  },
  themeColor: "cyan"
};

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        username: { label: "Username", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }
        await dbConnect();
        const user = await User.findOne({ email: credentials.email }).select("+password");

        if (user) {
          if (!user.password) {
            throw new Error("Account exists with Google provider. Please sign in with Google.");
          }
          const isMatch = await bcrypt.compare(credentials.password, user.password);
          if (!isMatch) {
            throw new Error("Invalid password");
          }
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.title,
            image: user.image,
          };
        } else {
          if (!credentials.username || credentials.username === "undefined") {
            throw new Error("Account does not exist. Please sign up.");
          }
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          const newUser = await User.create({
            email: credentials.email,
            password: hashedPassword,
            username: credentials.username,
            title: credentials.username,
            image: DEFAULT_PROFILE_IMAGE,
            ...DEFAULT_USER_DATA,
          } as any) as any;
          return {
            id: newUser._id.toString(),
            email: newUser.email,
            name: newUser.title,
            image: newUser.image,
          };
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const { email } = user;
        try {
          await dbConnect();
          const existingUser = await User.findOne({ email }).select("+password");

          if (existingUser) {
            if (existingUser.password) {
              return "/login?error=AccountExistsWithPassword";
            }
          } else {
            console.log("Creating new user for:", email);
            try {
              const newUser = await User.create({
                email,
                image: user.image || DEFAULT_PROFILE_IMAGE,
                title: user.name || "New User",
                ...DEFAULT_USER_DATA,
              } as any) as any;
              console.log("User created successfully:", newUser._id);
            } catch (createError) {
              console.error("Detailed error creating user:", createError);
              throw createError; // Re-throw to be caught by outer catch
            }
          }
          return true;
        } catch (error) {
          console.error("Error checking/creating user:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session }) {
      try {
        await dbConnect();
        const dbUser = await User.findOne({ email: session.user?.email });
        if (dbUser) {
          // @ts-ignore
          session.user.id = dbUser._id.toString();
          // @ts-ignore
          session.user.username = dbUser.username;
          // @ts-ignore
          session.user.isNewUser = !dbUser.username;
        }
      } catch (error) {
        console.error("Error fetching user for session:", error);
      }
      return session;
    },
  },
};
