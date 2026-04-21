import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "user@iitrpr.ac.in" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const email = credentials.email;
        const password = credentials.password;

        // Legacy hardcoded fallback for specific users
        if (password === "12345678") {
          let role = "USER";
          let name = "Applicant";
          let matched = false;
          
          switch (email) {
            case "jr@iitrpr.ac.in":
              role = "JA"; name = "Junior Assistant"; matched = true; break;
            case "ar@iitrpr.ac.in":
              role = "AR"; name = "Assistant Registrar"; matched = true; break;
            case "chief@iitrpr.ac.in":
              role = "CW"; name = "Chief Warden"; matched = true; break;
            case "user@iitrpr.ac.in":
              role = "STUDENT"; name = "Applicant"; matched = true; break;
          }

          if (matched) {
            return { id: email, name, email, role };
          }
        }

        // Database-backed authentication
        const dbUser = await prisma.user.findUnique({
          where: { email },
        });

        if (!dbUser) {
          throw new Error("No user found with this email");
        }

        if (dbUser.status === 'PENDING') {
          throw new Error("Account pending approval. Please contact administration.");
        }
        
        if (dbUser.status === 'REJECTED' || dbUser.status === 'BLOCKED') {
          throw new Error("Your account has been deactivated.");
        }

        const isPasswordValid = await bcrypt.compare(password, dbUser.password);

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return { 
          id: dbUser.id, 
          name: dbUser.name, 
          email: dbUser.email, 
          role: dbUser.role 
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        // The id returned by database auth is the dbUser.id, for legacy it's the email
        token.userId = user.id; 
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        (session.user as any).role = token.role as string;
        (session.user as any).userId = token.userId as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login', 
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
