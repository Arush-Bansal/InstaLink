import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const { email } = user;
        try {
          await dbConnect();
          const existingUser = await User.findOne({ email });

          if (!existingUser) {
            await User.create({
              email,
              image: user.image,
              title: user.name || "New User",
            });
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
