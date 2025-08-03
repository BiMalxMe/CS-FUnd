import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "@/hooks/use-toast";
import * as anchor from "@coral-xyz/anchor";
import { getProvider, getProgram, getCampaignPda, getProgramStatePda, solToLamports } from "@/lib/anchor";
import { SystemProgram } from "@solana/web3.js";

interface CreateCampaignDialogProps {
  onCampaignCreated: () => void;
}

export const CreateCampaignDialog = ({ onCampaignCreated }: CreateCampaignDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    goal: ""
  });

  const { wallet, publicKey } = useWallet();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet || !publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a campaign",
        variant: "destructive"
      });
      return;
    }

    if (loading) return; // Prevent duplicate submissions

    if (!formData.title || !formData.description || !formData.goal) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const goalAmount = parseFloat(formData.goal);
    if (goalAmount <= 0) {
      toast({
        title: "Invalid goal",
        description: "Goal amount must be greater than 0",
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
      
      // Get the current campaign count to derive the next campaign ID
      let campaignId: anchor.BN;
      try {
        const programState = await (program.account as any).programState.fetch(programStatePda);
        campaignId = programState.campaignCount.add(new anchor.BN(1));
      } catch (error) {
        // If program state doesn't exist, this will be the first campaign
        campaignId = new anchor.BN(1);
      }

      const [campaignPda] = getCampaignPda(campaignId);
      const goalLamports = solToLamports(goalAmount);

      // Get fresh blockhash and add unique nonce to prevent duplicate transactions
      const { blockhash, lastValidBlockHeight } = await provider.connection.getLatestBlockhash('finalized');
      
      // Add a small delay to ensure unique timestamps
      await new Promise(resolve => setTimeout(resolve, 100));

      // Use the direct RPC method with better error handling
      const tx = await program.methods
        .createCampaign(
          formData.title,
          formData.description,
          formData.imageUrl || "",
          goalLamports
        )
        .accounts({
          programState: programStatePda,
          campaign: campaignPda,
          creator: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc({
          commitment: 'finalized',
          skipPreflight: true,
          preflightCommitment: 'finalized',
        });

      console.log("Campaign created with tx:", tx);

      toast({
        title: "Success!",
        description: "Your campaign has been created successfully",
      });

      setFormData({ title: "", description: "", imageUrl: "", goal: "" });
      setOpen(false);
      onCampaignCreated();
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create campaign",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="hero" size="lg" className="gap-2">
          <Plus className="w-5 h-5" />
          Create Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-card border-border" aria-describedby="create-campaign-description">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create New Campaign</DialogTitle>
        </DialogHeader>
        <p id="create-campaign-description" className="sr-only">
          Fill out the form below to create a new crowdfunding campaign
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Campaign Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter campaign title (max 64 characters)"
              maxLength={64}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your campaign (max 512 characters)"
              maxLength={512}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL (optional)</Label>
            <Input
              id="imageUrl"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
              maxLength={256}
              type="url"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal">Funding Goal (SOL) *</Label>
            <Input
              id="goal"
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              placeholder="10.0"
              type="number"
              step="0.1"
              min="0"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Create Campaign
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};