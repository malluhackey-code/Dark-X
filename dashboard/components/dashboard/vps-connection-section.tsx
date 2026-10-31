/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║                                                                  ║
 * ║       VPS Node Connection Configuration (IP & Port Section)      ║
 * ║                                                                  ║
 * ║   Allows easily configuring the VPS IP and Port directly in the  ║
 * ║   dashboard UI with live connection testing & health metrics.     ║
 * ║                                                                  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

"use client";

import React, { useState, useEffect } from "react";
import { 
  Server, 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  AlertTriangle, 
  Save, 
  RotateCcw, 
  Activity, 
  Key, 
  Globe, 
  Eye, 
  EyeOff,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DEFAULT_VPS_PORT, DEFAULT_VPS_IP, getClientVpsConfig } from "@/lib/vps-config";

export function VpsConnectionSection({ onConnected }: { onConnected?: () => void }) {
  const [ip, setIp] = useState(DEFAULT_VPS_IP);
  const [port, setPort] = useState(DEFAULT_VPS_PORT);
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "testing" | "idle">("idle");
  const [latency, setLatency] = useState<string | null>(null);
  const [botName, setBotName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load initial settings on mount
  useEffect(() => {
    const saved = getClientVpsConfig();
    if (saved) {
      setIp(saved.ip || DEFAULT_VPS_IP);
      setPort(saved.port || DEFAULT_VPS_PORT);
      setApiKey(saved.apiKey || "");
    } else {
      setIp(process.env.NEXT_PUBLIC_VPS_IP || DEFAULT_VPS_IP);
      setPort(process.env.NEXT_PUBLIC_VPS_PORT || DEFAULT_VPS_PORT);
      setApiKey(process.env.NEXT_PUBLIC_DASHBOARD_API_KEY || "ZYROX_SECURE_API_KEY_12345_CHANGE_THIS_ASAP_BY_CODEX_DEVS");
    }
  }, []);

  const handleTestConnection = async () => {
    if (!ip.trim()) {
      toast.error("Please enter your VPS IP or Hostname");
      return;
    }

    setTesting(true);
    setConnectionStatus("testing");
    setErrorMessage(null);

    const startTime = performance.now();

    try {
      const cleanIp = ip.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
      const cleanPort = (port || DEFAULT_VPS_PORT).toString().trim().replace(/[^0-9]/g, "") || DEFAULT_VPS_PORT;
      const cleanKey = apiKey.trim() || process.env.NEXT_PUBLIC_DASHBOARD_API_KEY || "";

      const res = await fetch("/api/proxy/bot/info", {
        headers: {
          "x-vps-ip": cleanIp,
          "x-vps-port": cleanPort,
          "x-vps-api-key": cleanKey,
        },
        cache: "no-store",
      });

      const roundTrip = Math.round(performance.now() - startTime);

      if (!res.ok) {
        let errData;
        try {
          errData = await res.json();
        } catch {
          errData = { detail: res.statusText };
        }
        throw new Error(errData.detail || `Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      setLatency(`${roundTrip}ms`);
      setBotName(data.name || "Dark X");
      setConnectionStatus("connected");
      toast.success(`Connected successfully to ${data.name || "Bot"}! (${roundTrip}ms)`);
      if (onConnected) onConnected();
    } catch (err: any) {
      console.error("VPS connection test failed:", err);
      setConnectionStatus("disconnected");
      setErrorMessage(err.message || "Failed to reach VPS API server.");
      toast.error("Connection failed! Check VPS IP, Port, and firewall.");
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    if (!ip.trim()) {
      toast.error("VPS IP cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      const cleanIp = ip.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
      const cleanPort = (port || DEFAULT_VPS_PORT).toString().trim().replace(/[^0-9]/g, "") || DEFAULT_VPS_PORT;
      const cleanKey = apiKey.trim() || process.env.NEXT_PUBLIC_DASHBOARD_API_KEY || "";

      const payload = {
        ip: cleanIp,
        port: cleanPort,
        apiKey: cleanKey,
      };

      // 1. Save to LocalStorage
      localStorage.setItem("vps_connection", JSON.stringify(payload));

      // 2. Save to Cookie (accessible by server-side Next.js route handlers)
      document.cookie = `vps_connection=${encodeURIComponent(
        JSON.stringify(payload)
      )}; path=/; max-age=31536000; SameSite=Lax`;

      toast.success("VPS Connection settings saved!");
      // Automatically test connection after saving
      handleTestConnection();
    } catch (e) {
      toast.error("Failed to save settings to browser.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem("vps_connection");
    document.cookie = "vps_connection=; path=/; max-age=0";
    setIp(process.env.NEXT_PUBLIC_VPS_IP || "");
    setPort(process.env.NEXT_PUBLIC_VPS_PORT || DEFAULT_VPS_PORT);
    setApiKey(process.env.NEXT_PUBLIC_DASHBOARD_API_KEY || "");
    setConnectionStatus("idle");
    setLatency(null);
    setErrorMessage(null);
    toast.info("Reset to default environment settings.");
  };

  return (
    <div className="relative group overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0f172a]/95 backdrop-blur-2xl p-8 lg:p-10 shadow-2xl transition-all duration-500 hover:border-red-500/20">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-red-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-800/10 border border-red-500/30 flex items-center justify-center shadow-lg shadow-red-500/10">
            <Server className="h-7 w-7 text-red-500" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-white tracking-tight font-outfit">
                VPS Bot Connection
              </h2>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-red-500/10 text-red-400 border-red-500/20">
                <Sparkles className="h-3 w-3" />
                IP & Port Mode
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-1 font-medium">
              Only add your VPS Server IP and Port here to connect this dashboard to your Discord bot.
            </p>
          </div>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center gap-2">
          {connectionStatus === "connected" && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="h-4 w-4" />
              <span>Online {latency ? `(${latency})` : ""}</span>
            </div>
          )}
          {connectionStatus === "disconnected" && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
              <WifiOff className="h-4 w-4" />
              <span>Offline / Unreachable</span>
            </div>
          )}
          {connectionStatus === "testing" && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold animate-pulse">
              <Activity className="h-4 w-4 animate-spin" />
              <span>Testing Connection...</span>
            </div>
          )}
          {connectionStatus === "idle" && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/5 text-slate-400 text-xs font-bold">
              <Wifi className="h-4 w-4 text-slate-500" />
              <span>Ready to Connect</span>
            </div>
          )}
        </div>
      </div>

      {/* Input Fields */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* VPS IP / Host */}
        <div className="md:col-span-7 space-y-2">
          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 pl-1">
            <Globe className="h-3.5 w-3.5 text-red-500" />
            VPS Server IP or Hostname
          </label>
          <div className="relative">
            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="e.g. 143.198.12.34 or vps.domain.com"
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3.5 text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all font-mono"
            />
          </div>
          <p className="text-[11px] text-slate-500 pl-1">
            Your VPS public IP address or node hostname where the bot is running.
          </p>
        </div>

        {/* VPS Port */}
        <div className="md:col-span-5 space-y-2">
          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 pl-1">
            <Activity className="h-3.5 w-3.5 text-red-500" />
            VPS Port
          </label>
          <div className="relative">
            <input
              type="text"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder="8080"
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3.5 text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all font-mono"
            />
          </div>
          <p className="text-[11px] text-slate-500 pl-1">
            The port set in your bot&apos;s .env (<code className="text-red-400">API_PORT</code>, default: 8080).
          </p>
        </div>

        {/* Dashboard API Key */}
        <div className="md:col-span-12 space-y-2">
          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 pl-1">
            <Key className="h-3.5 w-3.5 text-indigo-400" />
            Dashboard API Secret Key (Shared Key)
          </label>
          <div className="relative">
            <input
              type={showApiKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste DASHBOARD_API_KEY from bot .env..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3.5 pr-12 text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
            >
              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-[11px] text-slate-500 pl-1">
            Must match <code className="text-indigo-400">DASHBOARD_API_KEY</code> in your bot&apos;s .env file.
          </p>
        </div>
      </div>

      {/* Target URL Preview */}
      <div className="mt-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-mono">
          <span className="text-slate-500 font-bold">API Target:</span>
          <span className="text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded-lg border border-red-500/20">
            http://{ip.trim() || "<vps_ip>"}:{port || "8080"}/api/v1
          </span>
        </div>
        <span className="text-[11px] text-slate-500">
          Proxy: <span className="text-emerald-400 font-medium">Bypasses Mixed-Content & SSL Restrictions</span>
        </span>
      </div>

      {/* Error Details if any */}
      {errorMessage && (
        <div className="mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-xs text-red-300">
          <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Connection Failed:</p>
            <p className="text-red-400 font-mono">{errorMessage}</p>
            <p className="text-slate-400 text-[11px] pt-1">
              • Make sure your bot is running on the VPS with <code className="text-white">API_ENABLED=true</code> in .env.<br />
              • Check that port <code className="text-white">{port || "8080"}</code> is opened in your VPS firewall / Pterodactyl allocations.<br />
              • Verify that <code className="text-white">DASHBOARD_API_KEY</code> matches.
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={handleTestConnection}
          disabled={testing || saving || !ip.trim()}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
        >
          <Activity className={cn("h-4 w-4 text-red-500", testing && "animate-spin")} />
          <span>{testing ? "Testing Ping..." : "Test Connection"}</span>
        </button>

        <button
          onClick={handleSave}
          disabled={testing || saving || !ip.trim()}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 hover:brightness-110 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-red-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? "Saving..." : "Save & Connect"}</span>
        </button>

        <button
          onClick={handleReset}
          type="button"
          className="sm:ml-auto text-slate-500 hover:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>
    </div>
  );
}
