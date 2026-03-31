import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

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
        if (credentials.password !== "12345678") return null;

        const email = credentials.email;
        let role = "USER";
        let name = "Applicant";
        
        switch (email) {
          case "jr@iitrpr.ac.in":
            role = "JA"; name = "Junior Assistant"; break;
          case "ar@iitrpr.ac.in":
            role = "AR"; name = "Assistant Registrar"; break;
          case "chief@iitrpr.ac.in":
            role = "CW"; name = "Chief Warden"; break;
          case "user@iitrpr.ac.in":
            role = "USER"; name = "Applicant"; break;
          default:
            return null; // Reject other emails based on user strict rules
        }

        return { id: email, name, email, role };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        (session.user as any).role = token.role as string;
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
