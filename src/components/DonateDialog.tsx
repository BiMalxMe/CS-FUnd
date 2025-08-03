import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Heart } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "@/hooks/use-toast";
import { Campaign } from "@/types/crowdfunding";
import * as anchor from "@coral-xyz/anchor";
import { getProvider, getProgram, getCampaignPda, getTransactionPda, solToLamports } from "@/lib/anchor";
import { SystemProgram } from "@solana/web3.js";

interface DonateDialogProps {
  campaign: Campaign | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDonationComplete: () => void;
}

export const DonateDialog = ({ campaign, open, onOpenChange, onDonationComplete }: DonateDialogProps) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const { wallet, publicKey } = useWallet();
  const { toast } = useToast();

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet || !publicKey || !campaign) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to donate",
        variant: "destructive"
      });
      return;
    }

    if (loading) return; // Prevent duplicate submissions

    const donationAmount = parseFloat(amount);
    if (donationAmount < 1) {
      toast({
        title: "Invalid amount",
        description: "Minimum donation is 1 SOL",
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
      
      // Get current campaign to calculate next donor count
      const currentCampaign = await (program.account as any).campaign.fetch(campaignPda);
      const nextDonorCount = currentCampaign.donors.add(new anchor.BN(1));
      
      const [transactionPda] = getTransactionPda(publicKey, campaign.cid, nextDonorCount);
      const amountLamports = solToLamports(donationAmount);

      // Get fresh blockhash and add unique nonce to prevent duplicate transactions
      const { blockhash, lastValidBlockHeight } = await provider.connection.getLatestBlockhash('finalized');
      
      // Add a small delay to ensure unique timestamps
      await new Promise(resolve => setTimeout(resolve, 100));

      // Use the direct RPC method with better error handling
      const tx = await program.methods
        .donate(campaign.cid, amountLamports)
        .accounts({
          campaign: campaignPda,
          transaction: transactionPda,
          donor: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc({
          commitment: 'finalized',
          skipPreflight: true,
          preflightCommitment: 'finalized',
        });

      console.log("Donation completed with tx:", tx);

      toast({
        title: "Success!",
        description: `Thank you for donating ${donationAmount} SOL to ${campaign.title}`,
      });

      setAmount("");
      onOpenChange(false);
      onDonationComplete();
    } catch (error: any) {
      console.error("Error donating:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to donate",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!campaign) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-card border-border" aria-describedby="donate-dialog-description">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Heart className="w-5 h-5 text-destructive" />
            Donate to Campaign
          </DialogTitle>
        </DialogHeader>
        <p id="donate-dialog-description" className="sr-only">
          Make a donation to support this campaign
        </p>
        
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <h3 className="font-medium text-foreground">{campaign.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {campaign.description}
            </p>
          </div>

          <form onSubmit={handleDonate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Donation Amount (SOL)</Label>
              <Input
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1.0"
                type="number"
                step="0.1"
                min="1"
                required
              />
              <p className="text-xs text-muted-foreground">
                Minimum donation: 1 SOL
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
                variant="success"
                disabled={loading}
                className="flex-1"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Donate
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};