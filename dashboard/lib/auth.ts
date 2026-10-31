/**
 * ══════════════════════════════════════════════════════════════════
 *                     DARK X - AUTHENTICATION
 * ══════════════════════════════════════════════════════════════════
 */
import DiscordProvider from "next-auth/providers/discord";
import type { AuthOptions } from "next-auth";

declare const process: any;

if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://smoothxmoderation.vercel.app";
}

const CLIENT_ID = process.env.DISCORD_CLIENT_ID || "1565751670795665438";
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || "PHTPI6WA4lfaEEjFmHsjByjkW6Vu_bAa";
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "zyrox_nextauth_default_secret_string_2026_change_me_BY_CODEX_DEVS";

export const authOptions: AuthOptions = {
  secret: NEXTAUTH_SECRET,
  providers: [
    DiscordProvider({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      authorization: { params: { scope: "identify guilds" } },
    }),
  ],
  callbacks: {
    async jwt({ token, account }: { token: any; account?: any }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.sub;
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/auth/error",
  },
};
