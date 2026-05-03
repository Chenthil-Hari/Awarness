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
            role: user.role || 'user',
            league: user.league || 'Bronze'
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
      try {
        const client = await clientPromise;
        const db = client.db();
        const usersCollection = db.collection("users");

        let baseUsername = user.name.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '');
        let username = baseUsername;
        let count = 0;
        while (await usersCollection.findOne({ username }) && count < 10) {
          username = `${baseUsername}_${Math.floor(Math.random() * 1000)}`;
          count++;
        }

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
          user.username = existingUser.username;
          user.xp = existingUser.xp || 0;
          user.streak = existingUser.streak || 0;
          user.role = existingUser.role || 'user';
          user.league = existingUser.league || 'Bronze';
        }
      }

      const dbUser = await usersCollection.findOne({ email: user.email });
      if (dbUser) user.role = dbUser.role || 'user';

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.username = user.username;
        token.xp = user.xp || 0;
        token.streak = user.streak || 0;
        token.role = user.role || 'user';
        token.completedMissions = user.completedMissions || [];
        token.league = user.league || 'Bronze';
      }
      
      if (trigger === "update" && session?.user?.username) {
        token.username = session.user.username;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token?.email) {
        const client = await clientPromise;
        const db = client.db();
        const usersCollection = db.collection("users");
        const dbUser = await usersCollection.findOne({ email: token.email });
        
        if (dbUser) {
          session.user.id = dbUser._id.toString();
          session.user.username = dbUser.username;
          session.user.xp = dbUser.xp || 0;
          session.user.streak = dbUser.streak || 0;
          session.user.role = dbUser.role || 'user';
          session.user.completedMissions = dbUser.completedMissions || [];
          session.user.badges = dbUser.badges || [];
          session.user.performance = dbUser.performance || {};
          session.user.history = dbUser.history || [];

          let calculatedLeague = 'Bronze';
          if (session.user.xp >= 3000) calculatedLeague = 'Hacker-Tier';
          else if (session.user.xp >= 1500) calculatedLeague = 'Gold';
          else if (session.user.xp >= 500) calculatedLeague = 'Silver';
          session.user.league = calculatedLeague;

          // --- STREAK LOGIC ---
          const now = new Date();
          const lastLogin = dbUser.lastLoginDate ? new Date(dbUser.lastLoginDate) : null;
          let currentStreak = dbUser.streak || 1;
          let shouldUpdate = false;

          if (lastLogin) {
            const lastDate = new Date(Date.UTC(lastLogin.getUTCFullYear(), lastLogin.getUTCMonth(), lastLogin.getUTCDate()));
            const nowDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
            const diffInDays = Math.floor((nowDate - lastDate) / (1000 * 3600 * 24));

            if (diffInDays === 1) {
              currentStreak += 1;
              shouldUpdate = true;
            } else if (diffInDays > 1) {
              currentStreak = 1;
              shouldUpdate = true;
            }
          } else {
            shouldUpdate = true;
          }

          if (shouldUpdate) {
            await usersCollection.updateOne(
              { email: token.email },
              { $set: { streak: currentStreak, lastLoginDate: now.toISOString() } }
            );
          } else {
            // Refresh last seen even if streak didn't change
            await usersCollection.updateOne(
              { email: token.email },
              { $set: { lastLoginDate: now.toISOString() } }
            );
          }
          session.user.streak = currentStreak;

          if (dbUser.league !== calculatedLeague) {
            await usersCollection.updateOne(
              { email: token.email },
              { $set: { league: calculatedLeague } }
            );
          }
        }
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
