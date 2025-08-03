import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Settings } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "@/hooks/use-toast";
import { ProgramState } from "@/types/crowdfunding";
import * as anchor from "@coral-xyz/anchor";
import { getProvider, getProgram, getProgramStatePda } from "@/lib/anchor";
import { SystemProgram } from "@solana/web3.js";

interface PlatformSettingsDialogProps {
  programState: ProgramState | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSettingsUpdated: () => void;
}

export const PlatformSettingsDialog = ({ programState, open, onOpenChange, onSettingsUpdated }: PlatformSettingsDialogProps) => {
  const [platformFee, setPlatformFee] = useState("");
  const [loading, setLoading] = useState(false);

  const { wallet, publicKey } = useWallet();
  const { toast } = useToast();

  useEffect(() => {
    if (programState) {
      setPlatformFee(programState.platformFee.toString());
      console.log("Platform Add is ", programState.platformAddress.toString());
    }
  }, [programState]);

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet || !publicKey || !programState) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to update platform settings",
        variant: "destructive"
      });
      return;
    }

    // Check if user is the platform admin (same as platform address)
    if (!programState.platformAddress.equals(publicKey)) {
      toast({
        title: "Unauthorized",
        description: "Only the platform admin can update these settings",
        variant: "destructive"
      });
      return;
    }

    if (loading) return; // Prevent duplicate submissions

    const newPlatformFee = parseInt(platformFee);
    if (isNaN(newPlatformFee) || newPlatformFee < 0 || newPlatformFee > 10000) {
      toast({
        title: "Invalid platform fee",
        description: "Platform fee must be between 0 and 10000 basis points (0-100%)",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const provider = getProvider(wallet);
      if (!provider) throw new Error("Provider not available");
      
      const program = getProgram(provider);
      const [programStatePda] = getProgramStatePda();

      // Get fresh blockhash
      const { blockhash, lastValidBlockHeight } = await provider.connection.getLatestBlockhash('finalized');
      
      // Add a small delay to ensure unique timestamps
      await new Promise(resolve => setTimeout(resolve, 100));

      // Use the direct RPC method with better error handling
      const tx = await program.methods
        .updatePlatformSettings(new anchor.BN(newPlatformFee))
        .accounts({
          updater: publicKey,
          programState: programStatePda,
        })
        .rpc({
          commitment: 'finalized',
          skipPreflight: true,
          preflightCommitment: 'finalized',
        });

      console.log("Platform settings update completed with tx:", tx);

      toast({
        title: "Success!",
        description: `Platform fee updated to ${(newPlatformFee / 100).toFixed(2)}%`,
      });

      onOpenChange(false);
      onSettingsUpdated();
    } catch (error: any) {
      console.error("Error updating platform settings:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update platform settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!programState) return null;

  const isAdmin = publicKey && programState.platformAddress.equals(publicKey);
  const currentFeePercentage = (programState.platformFee.toNumber() / 100).toFixed(2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-card border-border" aria-describedby="settings-dialog-description">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Platform Settings
          </DialogTitle>
        </DialogHeader>
        <p id="settings-dialog-description" className="sr-only">
          Update platform settings and configuration
        </p>
        
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <h3 className="font-medium text-foreground mb-2">Current Settings</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform Fee:</span>
                <span className="font-medium">{currentFeePercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform Address:</span>
                <span className="font-mono text-xs">{programState.platformAddress.toString().slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Campaigns:</span>
                <span className="font-medium">{programState.campaignCount.toString()}</span>
              </div>
            </div>
          </div>

          {!isAdmin ? (
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground">
                Only the platform administrator can update these settings.
              </p>
            </div>
          ) : (
            <form onSubmit={handleUpdateSettings} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platform-fee">Platform Fee (basis points)</Label>
                <Input
                  id="platform-fee"
                  value={platformFee}
                  onChange={(e) => setPlatformFee(e.target.value)}
                  placeholder="500"
                  type="number"
                  min="0"
                  max="10000"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  1 basis point = 0.01% • Current: {currentFeePercentage}% • Max: 100%
                </p>
              </div>

              <div className="p-3 rounded-lg bg-info/10 border border-info/20">
                <p className="text-sm text-info">
                  <strong>Note:</strong> Platform fees are collected when campaign creators withdraw funds.
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
                  Update Settings
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};