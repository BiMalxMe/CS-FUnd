import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { connection } from '@/lib/anchor';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export const WalletButton = () => {
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (publicKey) {
      const getBalance = async () => {
        try {
          const balance = await connection.getBalance(publicKey);
          setBalance(balance / LAMPORTS_PER_SOL);
        } catch (error) {
          console.error('Error fetching balance:', error);
        }
      };
      
      getBalance();
      const interval = setInterval(getBalance, 10000); // Update every 10s
      
      return () => clearInterval(interval);
    } else {
      setBalance(null);
    }
  }, [publicKey]);

  return (
    <div className="flex items-center gap-4">
      {publicKey && balance !== null && (
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary border border-border">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm font-medium">
            {balance.toFixed(4)} SOL
          </span>
        </div>
      )}
      <WalletMultiButton className="!bg-gradient-primary hover:!bg-primary-dark !text-primary-foreground !rounded-lg !font-medium !transition-all !duration-300 hover:!shadow-glow" />
    </div>
  );
};