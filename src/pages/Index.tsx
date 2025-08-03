import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "@/components/WalletButton";
import { CreateCampaignDialog } from "@/components/CreateCampaignDialog";
import { CampaignCard } from "@/components/CampaignCard";
import { DonateDialog } from "@/components/DonateDialog";
import { WithdrawDialog } from "@/components/WithdrawDialog";
import { DeleteCampaignDialog } from "@/components/DeleteCampaignDialog";
import { PlatformSettingsDialog } from "@/components/PlatformSettingsDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Target, TrendingUp, Users, Wallet, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Campaign, ProgramState } from "@/types/crowdfunding";
import * as anchor from "@coral-xyz/anchor";
import { getProvider, getProgram, getProgramStatePda, getCampaignPda, lamportsToSol } from "@/lib/anchor";

const Index = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [programState, setProgramState] = useState<ProgramState | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [donateDialogOpen, setDonateDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  
  const { wallet, publicKey } = useWallet();
  const { toast } = useToast();

  const fetchProgramState = async () => {
    try {
      if (!wallet) return;
      
      const provider = getProvider(wallet);
      if (!provider) return;
      
      const program = getProgram(provider);
      const [programStatePda] = getProgramStatePda();
      
      const state = await (program.account as any).programState.fetch(programStatePda);
      setProgramState(state);
    } catch (error) {
      console.log("Program state not initialized yet");
      setProgramState(null);
    }
  };

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      if (!wallet || !programState) {
        setCampaigns([]);
        return;
      }
      
      const provider = getProvider(wallet);
      if (!provider) return;
      
      const program = getProgram(provider);
      const campaignCount = programState.campaignCount.toNumber();
      
      const campaignPromises = [];
      for (let i = 1; i <= campaignCount; i++) {
        const [campaignPda] = getCampaignPda(new anchor.BN(i));
        campaignPromises.push(
          (program.account as any).campaign.fetch(campaignPda).catch(() => null)
        );
      }
      
      const campaigns = await Promise.all(campaignPromises);
      // Filter out null campaigns and inactive (deleted) campaigns
      setCampaigns(campaigns.filter(campaign => campaign && campaign.active));
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgramState();
  }, [wallet]);

  useEffect(() => {
    if (programState) {
      fetchCampaigns();
    } else {
      setLoading(false);
    }
  }, [programState, wallet]);

  const handleRefresh = () => {
    fetchProgramState();
  };

  const handleDonate = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setDonateDialogOpen(true);
  };

  const handleDonationComplete = () => {
    fetchCampaigns();
  };

  const handleWithdraw = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setWithdrawDialogOpen(true);
  };

  const handleWithdrawComplete = () => {
    fetchCampaigns();
  };

  const handleDelete = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setDeleteDialogOpen(true);
  };

  const handleDeleteComplete = () => {
    fetchCampaigns();
  };

  const handleOpenSettings = () => {
    setSettingsDialogOpen(true);
  };

  const handleSettingsUpdated = () => {
    fetchProgramState();
  };

  // Since we already filter out inactive campaigns, all displayed campaigns are active
  const activeCampaigns = campaigns; // All campaigns are already active
  const myCampaigns = campaigns.filter(c => publicKey && c.creator.equals(publicKey));

  const totalRaised = campaigns.reduce((sum, campaign) => 
    sum + lamportsToSol(campaign.amountRaised), 0
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
  <u>CrowdFund</u> <sub className="text-sm font-bold bg-gradient-primary bg-clip-text text-transparent">BiMalxMe</sub>
</h1>
              <Badge variant="secondary" className="text-xs">
                Devnet
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              {publicKey && programState && programState.platformAddress.equals(publicKey) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleOpenSettings}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              )}
              <WalletButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!publicKey ? (
          <div className="text-center py-16">
            <Wallet className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-8">
              Connect your Solana wallet to view and interact with campaigns
            </p>
            <div className="flex justify-center">
            <WalletButton />

            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats */}
            {programState && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-3">
                    <Target className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{programState.campaignCount.toString()}</p>
                      <p className="text-sm text-muted-foreground">Total Campaigns</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-success" />
                    <div>
                      <p className="text-2xl font-bold">{totalRaised.toFixed(2)} SOL</p>
                      <p className="text-sm text-muted-foreground">Total Raised</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-accent" />
                    <div>
                      <p className="text-2xl font-bold">{activeCampaigns.length}</p>
                      <p className="text-sm text-muted-foreground">Active Campaigns</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Campaigns</h2>
                <p className="text-muted-foreground">Discover and support amazing projects</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Refresh
                </Button>
                <CreateCampaignDialog onCampaignCreated={handleRefresh} />
              </div>
            </div>

            {/* Campaign Tabs */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all">All Campaigns ({campaigns.length})</TabsTrigger>
                <TabsTrigger value="my">My Campaigns ({myCampaigns.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-6">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : campaigns.length === 0 ? (
                  <div className="text-center py-16">
                    <Target className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Be the first to create a campaign!
                    </p>
                    <CreateCampaignDialog onCampaignCreated={handleRefresh} />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaigns.map((campaign) => (
                      <CampaignCard
                        key={campaign.cid.toString()}
                        campaign={campaign}
                        onDonate={handleDonate}
                        onWithdraw={handleWithdraw}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="my" className="mt-6">
                {myCampaigns.length === 0 ? (
                  <div className="text-center py-16">
                    <Target className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No campaigns created</h3>
                    <p className="text-muted-foreground mb-6">
                      Create your first campaign to get started!
                    </p>
                    <CreateCampaignDialog onCampaignCreated={handleRefresh} />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myCampaigns.map((campaign) => (
                      <CampaignCard
                        key={campaign.cid.toString()}
                        campaign={campaign}
                        onDonate={handleDonate}
                        onWithdraw={handleWithdraw}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      {/* Dialogs */}
      <DonateDialog
        campaign={selectedCampaign}
        open={donateDialogOpen}
        onOpenChange={setDonateDialogOpen}
        onDonationComplete={handleDonationComplete}
      />
      
      <WithdrawDialog
        campaign={selectedCampaign}
        open={withdrawDialogOpen}
        onOpenChange={setWithdrawDialogOpen}
        onWithdrawComplete={handleWithdrawComplete}
      />
      
      <DeleteCampaignDialog
        campaign={selectedCampaign}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDeleteComplete={handleDeleteComplete}
      />
      
      <PlatformSettingsDialog
        programState={programState}
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
        onSettingsUpdated={handleSettingsUpdated}
      />
    </div>
  );
};

export default Index;
