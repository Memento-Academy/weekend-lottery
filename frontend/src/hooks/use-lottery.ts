import { useState, useCallback, useEffect } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import {
  createPublicClient,
  http,
  encodeFunctionData,
  type Address,
  formatEther,
  parseEther,
} from "viem";
import { sepolia } from "viem/chains";
import { LOTTERY_ABI, LOTTERY_ADDRESS } from "@/lib/contracts"; // Assume these exports exist
import { createGaslessAccount } from "@/lib/zerodev";

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http("https://ethereum-sepolia.publicnode.com"), // Ankr was failing, trying PublicNode
});

export function useLottery() {
  const { user } = usePrivy();
  const { wallets } = useWallets();

  // Contract State
  const [playersCount, setPlayersCount] = useState<number>(0);
  const [totalPrize, setTotalPrize] = useState<string>("0");
  const [isLotteryActive, setIsLotteryActive] = useState<boolean>(false);
  const [owner, setOwner] = useState<Address | null>(null);
  const [players, setPlayers] = useState<Address[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<bigint>(0n);
  const [endTimestamp, setEndTimestamp] = useState<bigint>(0n);

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Read Contract Data
  const fetchContractData = useCallback(async () => {
    if (!LOTTERY_ADDRESS) return;

    try {
      const results = await publicClient.multicall({
        contracts: [
          {
            address: LOTTERY_ADDRESS,
            abi: LOTTERY_ABI,
            functionName: "getPlayersCount",
          },
          {
            address: LOTTERY_ADDRESS,
            abi: LOTTERY_ABI,
            functionName: "getTotalPrize",
          },
          {
            address: LOTTERY_ADDRESS,
            abi: LOTTERY_ABI,
            functionName: "lotteryActive",
          },
          { address: LOTTERY_ADDRESS, abi: LOTTERY_ABI, functionName: "owner" },
          {
            address: LOTTERY_ADDRESS,
            abi: LOTTERY_ABI,
            functionName: "getPlayers",
          },
          {
            address: LOTTERY_ADDRESS,
            abi: LOTTERY_ABI,
            functionName: "getTimeRemaining",
          },
          {
            address: LOTTERY_ADDRESS,
            abi: LOTTERY_ABI,
            functionName: "lotteryEndTimestamp",
          },
        ],
      });

      console.log(
        "Multicall Results:",
        results.map((r, i) => ({
          index: i,
          status: r.status,
          error: r.status === "failure" ? r.error : null,
        })),
      );

      if (results[0].status === "success")
        setPlayersCount(Number(results[0].result));
      if (results[1].status === "success")
        setTotalPrize(formatEther(results[1].result as bigint));
      if (results[2].status === "success")
        setIsLotteryActive(results[2].result as boolean);

      if (results[3].status === "success") {
        const ownerAddr = results[3].result as Address;
        setOwner(ownerAddr);
      } else {
        console.warn("Owner fetch failed:", results[3].error);
      }

      // Log for debugging (remove in production)
      /*
      console.log({
        owner: results[3].status === "success" ? results[3].result : "fail",
        user: user?.wallet?.address,
        match: (user?.wallet?.address?.toLowerCase() === (results[3].result as string)?.toLowerCase())
      });
      */

      if (results[4].status === "success")
        setPlayers(results[4].result as Address[]);

      if (results[5].status === "success")
        setTimeRemaining(results[5].result as bigint);

      if (results[6].status === "success")
        setEndTimestamp(results[6].result as bigint);
    } catch (err) {
      console.error("Error fetching contract data:", err);
    }
  }, []);

  // Initial fetch + interval
  useEffect(() => {
    fetchContractData();
    const interval = setInterval(fetchContractData, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [fetchContractData]);

  // Actions
  const getWallet = useCallback(async () => {
    const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");
    return embeddedWallet || wallets[0];
  }, [wallets]);

  const enterLottery = async () => {
    setIsLoading(true);
    setError(null);
    setTxHash(null);

    try {
      const wallet = await getWallet();
      if (!wallet) throw new Error("No wallet connected");

      // Switch chain
      const provider = await wallet.getEthereumProvider();
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }],
      });

      // Create ZeroDev client
      console.log("Creating Gasless Account...");
      const walletClient = await import("viem").then((m) =>
        m.createWalletClient({
          account: wallet.address as Address,
          chain: sepolia,
          transport: m.custom(provider),
        }),
      );

      const kernelClient = await createGaslessAccount(walletClient);

      console.log("Sending Gasless Tx...");
      const hash = await kernelClient.writeContract({
        address: LOTTERY_ADDRESS,
        abi: LOTTERY_ABI,
        functionName: "enterLottery",
        value: 0n, // FREE ENTRY
      });

      console.log("Tx Sent:", hash);
      setTxHash(hash);

      // Wait for confirmation
      await publicClient.waitForTransactionReceipt({ hash });
      await fetchContractData(); // Refresh UI
    } catch (err: unknown) {
      console.error("Enter Lottery Error:", err);
      const message = err instanceof Error ? err.message : "Transaction failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const pickWinner = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const wallet = await getWallet();
      if (!wallet) throw new Error("No wallet connected");

      const provider = await wallet.getEthereumProvider();
      const walletClient = await import("viem").then((m) =>
        m.createWalletClient({
          account: wallet.address as Address,
          chain: sepolia,
          transport: m.custom(provider),
        }),
      );

      const hash = await walletClient.writeContract({
        address: LOTTERY_ADDRESS,
        abi: LOTTERY_ABI,
        functionName: "performUpkeep",
        args: ["0x"],
      });

      setTxHash(hash);
      await publicClient.waitForTransactionReceipt({ hash });
      await fetchContractData();
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const startWeekendLottery = async (durationSeconds: number = 259200) => {
    setIsLoading(true);
    setError(null);
    try {
      const wallet = await getWallet();
      if (!wallet) throw new Error("No wallet connected");

      const provider = await wallet.getEthereumProvider();
      const walletClient = await import("viem").then((m) =>
        m.createWalletClient({
          account: wallet.address as Address,
          chain: sepolia,
          transport: m.custom(provider),
        }),
      );

      // Using walletClient directly (EOA)
      const hash = await walletClient.writeContract({
        address: LOTTERY_ADDRESS,
        abi: LOTTERY_ABI,
        functionName: "startWeekendLottery",
        args: [BigInt(durationSeconds)],
      });

      setTxHash(hash);
      await publicClient.waitForTransactionReceipt({ hash });
      await fetchContractData();
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const [smartAccountAddress, setSmartAccountAddress] =
    useState<Address | null>(null);

  // Check if current user is owner (case-insensitive)
  const isOwner =
    !!user?.wallet?.address &&
    !!owner &&
    user.wallet.address.toLowerCase() === owner.toLowerCase();

  // Debug log for owner detection
  useEffect(() => {
    if (!LOTTERY_ADDRESS || !owner) return;

    console.log("Lottery Owner Match:", {
      isMatch: isOwner,
      owner: owner,
      user: user?.wallet?.address,
    });
  }, [user, owner, isOwner]);

  // Fetch Smart Account Address
  useEffect(() => {
    let mounted = true;

    if (!user || wallets.length === 0) return;

    const fetchAccount = async () => {
      try {
        const wallet = await getWallet();
        if (!wallet) return;

        const provider = await wallet.getEthereumProvider();
        const walletClient = await import("viem").then((m) =>
          m.createWalletClient({
            account: wallet.address as Address,
            chain: sepolia,
            transport: m.custom(provider),
          }),
        );

        const kernelClient = await createGaslessAccount(walletClient);
        if (mounted) {
          setSmartAccountAddress(kernelClient.account.address);
          console.log("Smart Account Loaded:", kernelClient.account.address);
        }
      } catch (e) {
        console.error("Failed to fetch smart account", e);
      }
    };

    fetchAccount();

    return () => {
      mounted = false;
    };
  }, [wallets, user, getWallet]);

  return {
    // State
    playersCount,
    totalPrize,
    isLotteryActive,
    isOwner, // Return boolean directly
    owner,
    players,
    timeRemaining,
    endTimestamp,
    isLoading,
    txHash,
    error,
    userAddress: user?.wallet?.address,
    smartAccountAddress,
    // Actions
    enterLottery,
    pickWinner,
    startWeekendLottery,
    refresh: fetchContractData,
  };
}
