import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { sendStreakLostEmail } from "@/lib/mail";

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
      const client = await clientPromise;
      const db = client.db();
      const usersCollection = db.collection("users");

      if (account.provider === "google") {
        const existingUser = await usersCollection.findOne({ email: user.email });
        if (!existingUser) return false;
        user.username = existingUser.username;
        user.xp = existingUser.xp || 0;
        user.streak = existingUser.streak || 0;
      }

      // STREAK LOGIC
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
          } else if (diffInDays >= 2) {
            // Trigger streak lost email
            try {
              sendStreakLostEmail(user.email, dbUser.name || 'User', dbUser.streak || 0);
            } catch (err) { console.error("Streak mail error:", err); }
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
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session?.user?.username) {
        token.username = session.user.username;
      }
      
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.xp = user.xp || 0;
        token.streak = user.streak || 0;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.xp = token.xp || 0;
        session.user.streak = token.streak || 0;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
