import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

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
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          const newUser = await User.create({
            email: credentials.email,
            password: hashedPassword,
            username: credentials.username || undefined,
            title: credentials.username || "New User",
          });
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
            await User.create({
              email,
              image: user.image,
              title: user.name || "New User",
            } as any);
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
