"use client";

import { useLottery } from "@/hooks/use-lottery";
import { Trophy, ExternalLink, Award } from "lucide-react";

export function WinnerBanner() {
  const { lastWinner, isLotteryActive, smartAccountAddress } = useLottery();

  if (isLotteryActive || !lastWinner) return null;

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const isCurrentUser =
    smartAccountAddress &&
    lastWinner.winner.toLowerCase() === smartAccountAddress.toLowerCase();

  return (
    <div className="w-full rounded-2xl border border-amber-500/30 bg-amber-950/10 p-6 space-y-4 text-center">
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 ring-1 ring-amber-500/40">
          <Trophy className="h-6 w-6 text-amber-400" />
        </div>
        <p className="text-amber-400 font-bold text-lg">
          Last Winner — Round #{lastWinner.lotteryId.toString()}
        </p>
      </div>

      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
          Winner (Smart Account)
        </p>
        <a
          href={`https://sepolia.etherscan.io/address/${lastWinner.winner}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-mono text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          {truncate(lastWinner.winner)}
          <ExternalLink className="h-3 w-3" />
        </a>
        {isCurrentUser && (
          <p className="text-xs text-green-400 font-bold mt-1 flex items-center justify-center gap-1">
            <Award className="h-3 w-3" />
            That&apos;s you!
          </p>
        )}
      </div>

      <div className="rounded-xl bg-white/5 border border-white/5 py-3">
        <p className="text-2xl font-bold text-white">{lastWinner.prize} ETH</p>
        <p className="text-xs text-slate-500 mt-0.5">Prize Transferred</p>
      </div>

      <a
        href={`https://sepolia.etherscan.io/tx/${lastWinner.txHash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        Verify transfer on Etherscan Sepolia
      </a>
    </div>
  );
}
