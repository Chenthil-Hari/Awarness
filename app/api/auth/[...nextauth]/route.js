import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "@/lib/mail";

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
          return { 
            id: user._id.toString(), 
            name: user.name, 
            email: user.email,
            role: user.role || 'user'
          };
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
  events: {
    async createUser({ user }) {
      // This fires for Google signups (where the adapter creates the user)
      // Manual signups via signup/route.js handle their own email to avoid duplicates
      try {
        const client = await clientPromise;
        const db = client.db();
        const usersCollection = db.collection("users");

        // Check if username already exists (shouldn't for a brand new user, but safety first)
        let baseUsername = user.name.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '');
        let username = baseUsername;
        let count = 0;
        while (await usersCollection.findOne({ username }) && count < 10) {
          username = `${baseUsername}_${Math.floor(Math.random() * 1000)}`;
          count++;
        }

        // Initialize user with defaults
        await usersCollection.updateOne(
          { email: user.email },
          { 
            $set: { 
              username: username,
              xp: 0,
              streak: 1,
              role: 'user',
              createdAt: new Date()
            } 
          }
        );

        await sendWelcomeEmail(user.email, user.name);
        console.log("Welcome email sent to new Google user:", user.email);
      } catch (error) {
        console.error("Failed to initialize Google user or send email:", error);
      }
    }
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      const client = await clientPromise;
      const db = client.db();
      const usersCollection = db.collection("users");

      if (account.provider === "google") {
        const existingUser = await usersCollection.findOne({ email: user.email });
        if (existingUser) {
          // Update existing user session data
          user.username = existingUser.username;
          user.xp = existingUser.xp || 0;
          user.streak = existingUser.streak || 0;
          user.role = existingUser.role || 'user';
        } else {
          // New user will be handled by events.createUser
        }
      }

      // STREAK LOGIC for existing users
      const dbUser = await usersCollection.findOne({ email: user.email });
      if (dbUser) {
        const now = new Date();
        const lastLogin = dbUser.lastLoginDate ? new Date(dbUser.lastLoginDate) : null;
        
        let newStreak = dbUser.streak || 1;
        
        if (lastLogin) {
          const diffInTime = now.getTime() - lastLogin.getTime();
          const diffInDays = Math.floor(diffInTime / (1000 * 3600 * 24));

          if (diffInDays === 1) {
            newStreak += 1;
          } else if (diffInDays > 1) {
            newStreak = 1;
          }
        }

        await usersCollection.updateOne(
          { email: user.email },
          { 
            $set: { 
              lastLoginDate: now.toISOString(),
              streak: newStreak
            } 
          }
        );
        user.streak = newStreak;
        user.role = dbUser.role || 'user';
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email; // MASTER KEY
        token.username = user.username;
        token.xp = user.xp || 0;
        token.streak = user.streak || 0;
        token.role = user.role || 'user';
      }
      
      // Handle manual session updates (trigger: "update")
      if (trigger === "update" && session?.user?.username) {
        token.username = session.user.username;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token?.email) {
        // ALWAYS fetch latest data from DB to avoid stale JWT issues
        const client = await clientPromise;
        const dbUser = await client.db().collection("users").findOne({ email: token.email });
        
        if (dbUser) {
          session.user.id = dbUser._id.toString();
          session.user.username = dbUser.username;
          session.user.xp = dbUser.xp || 0;
          session.user.streak = dbUser.streak || 0;
          session.user.role = dbUser.role || 'user';
        } else {
          // Fallback to token
          session.user.id = token.id;
          session.user.username = token.username;
          session.user.xp = token.xp || 0;
          session.user.streak = token.streak || 0;
          session.user.role = token.role || 'user';
        }
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
