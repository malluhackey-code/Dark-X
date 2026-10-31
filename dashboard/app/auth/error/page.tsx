"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  AlertTriangle, 
  Copy, 
  Check, 
  ExternalLink, 
  RotateCcw, 
  ShieldAlert, 
  Key, 
  Globe 
} from "lucide-react";
import { Button } from "@/components/ui/button";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "Configuration";
  const [copied, setCopied] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://dark-x-nine.vercel.app";
  const redirectUri = `${origin}/api/auth/callback/discord`;

  const handleCopy = () => {
    navigator.clipboard.writeText(redirectUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getErrorExplanation = (err: string) => {
    switch (err) {
      case "Configuration":
        return {
          title: "NextAuth Configuration Error",
          desc: "Missing NEXTAUTH_SECRET, invalid Discord Client ID/Secret, or missing OAuth2 Redirect URI.",
        };
      case "OAuthCallback":
        return {
          title: "OAuth Callback Error",
          desc: "Discord rejected the callback. Your Discord Client Secret may have changed, or the Redirect URI is not registered in Discord.",
        };
      case "OAuthSignin":
        return {
          title: "OAuth Signin Error",
          desc: "Failed to construct the Discord sign-in URL. Check your Discord Client ID in Vercel environment variables.",
        };
      case "AccessDenied":
        return {
          title: "Access Denied",
          desc: "You canceled the Discord authorization or Discord blocked the request.",
        };
      default:
        return {
          title: `Authentication Error (${err})`,
          desc: "There was an issue authenticating with Discord. Follow the checklist below to resolve it.",
        };
    }
  };

  const explanation = getErrorExplanation(error);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex items-center justify-center p-4">
      {/* Ambient background glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-500/10 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[140px] rounded-full animate-pulse [animation-delay:2s]" />
      </div>

      <div className="relative w-full max-w-2xl bg-[#0f172a]/95 border border-white/10 rounded-[2.5rem] p-8 lg:p-12 shadow-2xl backdrop-blur-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-white/5">
          <div className="h-14 w-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-lg shadow-red-500/10">
            <ShieldAlert className="h-7 w-7 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white font-outfit tracking-tight">
              {explanation.title}
            </h1>
            <p className="text-xs text-red-400 mt-1 font-medium">
              {explanation.desc}
            </p>
          </div>
        </div>

        {/* Step-by-Step Fix Guide */}
        <div className="mt-8 space-y-6">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
            Fix Checklist (Takes 1 Minute)
          </h2>

          {/* Step 1: Redirect URI */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-[10px] font-black text-white">
                1
              </span>
              <h3 className="text-sm font-bold text-white">Add Redirect URI in Discord Developer Portal</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pl-7">
              Go to <strong className="text-white">Discord Developer Portal</strong> → Your Application → <strong className="text-white">OAuth2</strong> → <strong className="text-white">Redirects</strong>, and add this exact URL:
            </p>
            <div className="pl-7 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={redirectUri}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 font-mono text-xs text-emerald-400 select-all"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          {/* Step 2: Vercel Environment Variables */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center h-5 w-5 rounded-full bg-indigo-500 text-[10px] font-black text-white">
                2
              </span>
              <h3 className="text-sm font-bold text-white">Check Vercel Environment Variables</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pl-7">
              In your <strong className="text-white">Vercel Dashboard</strong> → Project → <strong className="text-white">Settings</strong> → <strong className="text-white">Environment Variables</strong>, ensure these 4 keys exist:
            </p>
            <div className="pl-7 space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between py-1 border-b border-white/5 text-slate-300">
                <span className="text-indigo-400 font-bold">NEXTAUTH_URL</span>
                <span>https://smoothxmoderation.vercel.app</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5 text-slate-300">
                <span className="text-indigo-400 font-bold">NEXTAUTH_SECRET</span>
                <span>(Any long random string)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5 text-slate-300">
                <span className="text-indigo-400 font-bold">DISCORD_CLIENT_ID</span>
                <span>Your Discord Application ID</span>
              </div>
              <div className="flex justify-between py-1 text-slate-300">
                <span className="text-indigo-400 font-bold">DISCORD_CLIENT_SECRET</span>
                <span>Your Discord Client Secret</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Link href="/" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-red-500/20 hover:brightness-110 active:scale-95 transition-all">
              <RotateCcw className="h-4 w-4" />
              <span>Try Logging In Again</span>
            </Button>
          </Link>

          <a
            href="https://discord.com/developers/applications"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Discord Developer Portal</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
