import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "@/hooks/use-toast";
import { Campaign } from "@/types/crowdfunding";
import * as anchor from "@coral-xyz/anchor";
import { getProvider, getProgram, getCampaignPda, lamportsToSol } from "@/lib/anchor";
import { SystemProgram } from "@solana/web3.js";

interface DeleteCampaignDialogProps {
  campaign: Campaign | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteComplete: () => void;
}

export const DeleteCampaignDialog = ({ campaign, open, onOpenChange, onDeleteComplete }: DeleteCampaignDialogProps) => {
  const [loading, setLoading] = useState(false);

  const { wallet, publicKey } = useWallet();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!wallet || !publicKey || !campaign) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to delete the campaign",
        variant: "destructive"
      });
      return;
    }

    // Check if user is the campaign creator
    if (!campaign.creator.equals(publicKey)) {
      toast({
        title: "Unauthorized",
        description: "Only the campaign creator can delete this campaign",
        variant: "destructive"
      });
      return;
    }

    if (loading) return; // Prevent duplicate submissions

    const balance = lamportsToSol(campaign.balance);
    if (balance > 0) {
      toast({
        title: "Cannot delete campaign",
        description: "Please withdraw all funds before deleting the campaign",
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

      // Get fresh blockhash
      const { blockhash, lastValidBlockHeight } = await provider.connection.getLatestBlockhash('finalized');
      
      // Add a small delay to ensure unique timestamps
      await new Promise(resolve => setTimeout(resolve, 100));

      // Use the direct RPC method with better error handling
      const tx = await program.methods
        .deleteCampaign(campaign.cid)
        .accounts({
          campaign: campaignPda,
          creator: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc({
          commitment: 'finalized',
          skipPreflight: true,
          preflightCommitment: 'finalized',
        });

      console.log("Campaign deletion completed with tx:", tx);

      toast({
        title: "Success!",
        description: `Campaign "${campaign.title}" has been deleted successfully`,
      });

      onOpenChange(false);
      onDeleteComplete();
    } catch (error: any) {
      console.error("Error deleting campaign:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete campaign",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!campaign) return null;

  const balance = lamportsToSol(campaign.balance);
  const isCreator = publicKey && campaign.creator.equals(publicKey);
  const canDelete = isCreator && balance === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-card border-border" aria-describedby="delete-dialog-description">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-destructive" />
            Delete Campaign
          </DialogTitle>
        </DialogHeader>
        <p id="delete-dialog-description" className="sr-only">
          Delete your campaign permanently
        </p>
        
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <h3 className="font-medium text-foreground">{campaign.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {campaign.description}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Balance: <span className="font-medium text-foreground">{balance.toFixed(2)} SOL</span>
            </p>
          </div>

          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-destructive">
                Warning: This action cannot be undone
              </p>
              <p className="text-sm text-destructive/80">
                Deleting this campaign will permanently remove it from the platform. 
                All campaign data will be lost.
              </p>
            </div>
          </div>

          {!isCreator ? (
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground">
                Only the campaign creator can delete this campaign.
              </p>
            </div>
          ) : balance > 0 ? (
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
              <p className="text-sm text-warning">
                You must withdraw all funds ({balance.toFixed(2)} SOL) before deleting this campaign.
              </p>
            </div>
          ) : (
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
                onClick={handleDelete}
                variant="destructive"
                disabled={loading || !canDelete}
                className="flex-1"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Delete Campaign
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};