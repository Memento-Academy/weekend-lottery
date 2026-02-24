"use client";

import { LotteryCard } from "@/components/lottery-card";
import { OwnerPanel } from "@/components/owner-panel";
import { WinnerBanner } from "@/components/winner-banner";
import { useLottery } from "@/hooks/use-lottery";
import { Clock, Timer } from "lucide-react";

export default function Home() {
  const { players, timeRemaining, isOwner } = useLottery();

  const formatDuration = (seconds: bigint) => {
    const s = Number(seconds);
    const d = Math.floor(s / (3600 * 24));
    const h = Math.floor((s % (3600 * 24)) / 3600);
    const m = Math.floor((s % 3600) / 60);

    if (d > 0) return `${d}d ${h}h ${m}m`;
    return `${h}h ${m}m`; // Show only H:M if < 24h
  };

  return (
    <div className="container mx-auto px-4 py-24 flex flex-col items-center gap-12">
      <div className="text-center space-y-4 max-w-2xl">
        {timeRemaining > 0n ? (
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold animate-pulse mb-4">
            <Clock className="w-4 h-4" />
            CLOSING IN: {formatDuration(timeRemaining)}
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-sm font-medium mb-4">
            <Timer className="w-4 h-4" />
            LOTTERY CLOSED
          </div>
        )}

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
          Win Big on the <span className="text-cyan-400">Weekend</span> Lottery
        </h1>
        <p className="text-lg text-slate-400">
          A transparent, decentralized lottery built for the weekend.
          <br />
          Gasless entry. 72h automated cycles.
        </p>
      </div>

      <div className="w-full max-w-md space-y-8">
        <LotteryCard />

        <WinnerBanner />

        {isOwner && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <OwnerPanel />
          </div>
        )}
      </div>

      {/* Recent Players / Live Feed could go here */}
      {players.length > 0 && (
        <div className="w-full max-w-2xl mt-8">
          <h3 className="text-sm font-medium text-slate-500 mb-4 uppercase tracking-wider text-center">
            Recent Entries
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            {players
              .slice(-5)
              .reverse()
              .map((player, i) => (
                <div
                  key={i}
                  className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400"
                >
                  {player.slice(0, 6)}...{player.slice(-4)}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
