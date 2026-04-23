import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const client = await clientPromise;
        const usersCollection = client.db().collection("users");

        const user = await usersCollection.findOne({ email: credentials.email });

        if (user && bcrypt.compareSync(credentials.password, user.password)) {
          return { id: user._id.toString(), name: user.name, email: user.email };
        }

        return null;
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === "google") {
        const client = await clientPromise;
        const db = client.db();
        const usersCollection = db.collection("users");

        // Check if user already exists in our DB
        const existingUser = await usersCollection.findOne({ email: user.email });

        if (!existingUser) {
          // Generate a base username from the Google name
          let baseUsername = profile.name.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '');
          let uniqueUsername = baseUsername;
          let counter = 1;

          // Keep checking until we find a unique username
          while (await usersCollection.findOne({ username: uniqueUsername })) {
            uniqueUsername = `${baseUsername}_${Math.floor(Math.random() * 1000)}`;
            counter++;
          }

          // Attach the unique username to the user object before creation
          user.username = uniqueUsername;
          // The adapter will handle the insertion, but we can also do it manually if needed
          // However, NextAuth adapter inserts the 'user' object.
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
