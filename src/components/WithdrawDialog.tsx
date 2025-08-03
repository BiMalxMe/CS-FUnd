import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Wallet } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "@/hooks/use-toast";
import { Campaign } from "@/types/crowdfunding";
import * as anchor from "@coral-xyz/anchor";
import { getProvider, getProgram, getCampaignPda, getWithdrawPda, getProgramStatePda, solToLamports, lamportsToSol } from "@/lib/anchor";
import { SystemProgram } from "@solana/web3.js";

interface WithdrawDialogProps {
  campaign: Campaign | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWithdrawComplete: () => void;
}

export const WithdrawDialog = ({ campaign, open, onOpenChange, onWithdrawComplete }: WithdrawDialogProps) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const { wallet, publicKey } = useWallet();
  const { toast } = useToast();

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet || !publicKey || !campaign) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to withdraw",
        variant: "destructive"
      });
      return;
    }

    // Check if user is the campaign creator
    if (!campaign.creator.equals(publicKey)) {
      toast({
        title: "Unauthorized",
        description: "Only the campaign creator can withdraw funds",
        variant: "destructive"
      });
      return;
    }

    if (loading) return; // Prevent duplicate submissions

    const withdrawAmount = parseFloat(amount);
    const availableBalance = lamportsToSol(campaign.balance);
    
    if (withdrawAmount < 1) {
      toast({
        title: "Invalid amount",
        description: "Minimum withdrawal is 1 SOL",
        variant: "destructive"
      });
      return;
    }

    if (withdrawAmount > availableBalance) {
      toast({
        title: "Insufficient funds",
        description: `Available balance: ${availableBalance.toFixed(2)} SOL`,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const provider = getProvider(wallet);
      if (!provider) throw new Error("Provider not available");
      
      const program = getProgram(provider);
      const [campaignPda] = getCampaignPda(campaign.cid);
      const [programStatePda] = getProgramStatePda();
      
      // Get current campaign to calculate next withdrawal count
      const currentCampaign = await (program.account as any).campaign.fetch(campaignPda);
      const nextWithdrawalCount = currentCampaign.withdrawals.add(new anchor.BN(1));
      
      // Get program state to get platform address
      const programState = await (program.account as any).programState.fetch(programStatePda);
      
      const [transactionPda] = getWithdrawPda(publicKey, campaign.cid, nextWithdrawalCount);
      const amountLamports = solToLamports(withdrawAmount);

      // Get fresh blockhash and add unique nonce to prevent duplicate transactions
      const { blockhash, lastValidBlockHeight } = await provider.connection.getLatestBlockhash('finalized');
      
      // Add a small delay to ensure unique timestamps
      await new Promise(resolve => setTimeout(resolve, 100));

      // Use the direct RPC method with better error handling
      const tx = await program.methods
        .withdraw(campaign.cid, amountLamports)
        .accounts({
          campaign: campaignPda,
          transaction: transactionPda,
          programState: programStatePda,
          platformAddress: programState.platformAddress,
          creator: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc({
          commitment: 'finalized',
          skipPreflight: true,
          preflightCommitment: 'finalized',
        });

      console.log("Withdrawal completed with tx:", tx);

      toast({
        title: "Success!",
        description: `Successfully withdrew ${withdrawAmount} SOL from ${campaign.title}`,
      });

      setAmount("");
      onOpenChange(false);
      onWithdrawComplete();
    } catch (error: any) {
      console.error("Error withdrawing:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to withdraw funds",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!campaign) return null;

  const availableBalance = lamportsToSol(campaign.balance);
  const isCreator = publicKey && campaign.creator.equals(publicKey);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-card border-border" aria-describedby="withdraw-dialog-description">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Withdraw Funds
          </DialogTitle>
        </DialogHeader>
        <p id="withdraw-dialog-description" className="sr-only">
          Withdraw funds from your campaign
        </p>
        
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <h3 className="font-medium text-foreground">{campaign.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Available Balance: <span className="font-medium text-foreground">{availableBalance.toFixed(2)} SOL</span>
            </p>
          </div>

          {!isCreator ? (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">
                Only the campaign creator can withdraw funds from this campaign.
              </p>
            </div>
          ) : availableBalance === 0 ? (
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground">
                No funds available for withdrawal at this time.
              </p>
            </div>
          ) : (
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="withdraw-amount">Withdrawal Amount (SOL)</Label>
                <Input
                  id="withdraw-amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1.0"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max={availableBalance}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Minimum withdrawal: 1 SOL • Available: {availableBalance.toFixed(2)} SOL
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Withdraw
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};