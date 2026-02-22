import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLottery } from "@/hooks/use-lottery";
import { Loader2, Trophy, RefreshCw, Gavel } from "lucide-react";

export function OwnerPanel() {
  const {
    isLotteryActive,
    playersCount,
    startWeekendLottery,
    pickWinner,
    isLoading,
    totalPrize,
    timeRemaining,
  } = useLottery();

  // Default to 3 days (in seconds, but input is days for UX)
  const [durationDays, setDurationDays] = useState("3");

  return (
    <Card className="border-cyan-500/20 bg-cyan-950/10">
      <CardHeader>
        <CardTitle className="text-cyan-400">Admin Panel</CardTitle>
        <CardDescription>Only visible to the contract owner</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLotteryActive && timeRemaining === 0n ? (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg bg-slate-900/50 p-4">
              <p className="text-sm text-slate-400">Current Prize Pool</p>
              <p className="text-2xl font-bold text-white mb-2">
                {totalPrize} ETH
              </p>
              <p className="text-sm text-slate-400">Players: {playersCount}</p>
            </div>

            <p className="text-xs text-center text-amber-400 animate-pulse">
              Timer expired. Pick the winner to distribute the prize.
            </p>

            <Button
              onClick={pickWinner}
              disabled={isLoading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Gavel className="mr-2 h-4 w-4" />
              )}
              Pick Winner Now
            </Button>
          </div>
        ) : isLotteryActive ? (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg bg-slate-900/50 p-4">
              <p className="text-sm text-slate-400">Current Prize Pool</p>
              <p className="text-2xl font-bold text-white mb-2">
                {totalPrize} ETH
              </p>
              <p className="text-sm text-slate-400">Players: {playersCount}</p>
            </div>

            <p className="text-xs text-center text-slate-500 animate-pulse">
              Lottery is active. Will auto-close when timer ends.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Duration (Days)
              </label>
              <input
                title="duration"
                type="number"
                min="1"
                step="1"
                value={durationDays}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (val >= 1 || e.target.value === "")
                    setDurationDays(e.target.value);
                }}
                className="flex h-10 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            <Button
              onClick={() => {
                const seconds = parseFloat(durationDays) * 24 * 60 * 60;
                startWeekendLottery(seconds);
              }}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Start Weekend Lottery
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
