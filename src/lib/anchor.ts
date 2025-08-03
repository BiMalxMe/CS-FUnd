import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { CROWDFUNDING_PROGRAM_ID, IDL } from "@/types/crowdfunding";

// Use devnet
export const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

export const getProvider = (wallet: any) => {
  if (!wallet || !wallet.adapter) return null;
  
  // Create a wallet adapter compatible with Anchor
  const anchorWallet = {
    publicKey: wallet.adapter.publicKey,
    signTransaction: wallet.adapter.signTransaction?.bind(wallet.adapter),
    signAllTransactions: wallet.adapter.signAllTransactions?.bind(wallet.adapter),
  };
  
  return new anchor.AnchorProvider(
    connection,
    anchorWallet,
    {
      commitment: 'confirmed',
      preflightCommitment: 'confirmed',
      skipPreflight: false,
    }
  );
};

export const getProgram = (provider: anchor.Provider) => {
  return new anchor.Program(IDL as unknown as anchor.Idl, provider);
};

export const getProgramStatePda = () => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("program_state")],
    CROWDFUNDING_PROGRAM_ID
  );
};

export const getCampaignPda = (campaignId: anchor.BN) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("campaign"), campaignId.toArrayLike(Buffer, "le", 8)],
    CROWDFUNDING_PROGRAM_ID
  );
};

export const getTransactionPda = (
  donor: PublicKey,
  campaignId: anchor.BN,
  donorCount: anchor.BN
) => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("donor"),
      donor.toBuffer(),
      campaignId.toArrayLike(Buffer, "le", 8),
      donorCount.toArrayLike(Buffer, "le", 8),
    ],
    CROWDFUNDING_PROGRAM_ID
  );
};

export const getWithdrawPda = (
  creator: PublicKey,
  campaignId: anchor.BN,
  withdrawalCount: anchor.BN
) => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("withdraw"),
      creator.toBuffer(),
      campaignId.toArrayLike(Buffer, "le", 8),
      withdrawalCount.toArrayLike(Buffer, "le", 8),
    ],
    CROWDFUNDING_PROGRAM_ID
  );
};

// Utility functions
export const lamportsToSol = (lamports: number | anchor.BN) => {
  const value = typeof lamports === "number" ? lamports : lamports.toNumber();
  return value / anchor.web3.LAMPORTS_PER_SOL;
};

export const solToLamports = (sol: number) => {
  return new anchor.BN(sol * anchor.web3.LAMPORTS_PER_SOL);
};