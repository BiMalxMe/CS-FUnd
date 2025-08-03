import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Target, Wallet, Edit, Trash2 } from "lucide-react";
import { Campaign } from "@/types/crowdfunding";
import { lamportsToSol } from "@/lib/anchor";
import { useWallet } from "@solana/wallet-adapter-react";

interface CampaignCardProps {
  campaign: Campaign;
  onDonate: (campaign: Campaign) => void;
  onWithdraw?: (campaign: Campaign) => void;
  onEdit?: (campaign: Campaign) => void;
  onDelete?: (campaign: Campaign) => void;
}

export const CampaignCard = ({ campaign, onDonate, onWithdraw, onEdit, onDelete }: CampaignCardProps) => {
  const { publicKey } = useWallet();
  const isCreator = publicKey && campaign.creator.equals(publicKey);
  
  const goal = lamportsToSol(campaign.goal);
  const raised = lamportsToSol(campaign.amountRaised);
  const balance = lamportsToSol(campaign.balance);
  const progress = (raised / goal) * 100;
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <Card className="group hover:shadow-card transition-smooth border-border bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground line-clamp-2">
              {campaign.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {campaign.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={campaign.active ? "default" : "destructive"}
              className="shrink-0"
            >
              {campaign.active ? "Active" : "Inactive"}
            </Badge>
            {isCreator && (
              <Badge variant="secondary" className="shrink-0">
                Your Campaign
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {campaign.imageUrl && (
          <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
            <img 
              src={campaign.imageUrl} 
              alt={campaign.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
            />
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {raised.toFixed(2)} / {goal.toFixed(2)} SOL
            </span>
          </div>
          <Progress value={Math.min(progress, 100)} className="h-2" />
          <div className="text-right text-xs text-muted-foreground">
            {progress.toFixed(1)}% funded
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span>{campaign.donors.toString()} donors</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Target className="w-4 h-4 text-muted-foreground" />
            <span>{goal.toFixed(2)} SOL goal</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Wallet className="w-4 h-4 text-muted-foreground" />
            <span>{balance.toFixed(2)} SOL available</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{formatDate(campaign.timestamp.toNumber())}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="gap-2 pt-4">
        {campaign.active ? (
          <>
            <Button 
              onClick={() => onDonate(campaign)}
              variant="success"
              size="sm"
              className="flex-1"
              disabled={!publicKey}
            >
              Donate
            </Button>
            {isCreator && onWithdraw && balance > 0 && (
              <Button 
                onClick={() => onWithdraw(campaign)}
                variant="outline"
                size="sm"
              >
                Withdraw
              </Button>
            )}
            {isCreator && onEdit && (
              <Button
                onClick={() => onEdit(campaign)}
                variant="ghost"
                size="sm"
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            {isCreator && onDelete && (
              <Button
                onClick={() => onDelete(campaign)}
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </>
        ) : (
          <div className="w-full text-center text-sm text-muted-foreground py-2">
            Campaign is no longer active
          </div>
        )}
      </CardFooter>
    </Card>
  );
};