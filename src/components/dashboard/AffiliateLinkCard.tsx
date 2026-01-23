import { useState } from "react";
import { Copy, Check, Link } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export const AffiliateLinkCard = () => {
  const [copied, setCopied] = useState(false);
  const { profile } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const affiliateLink = profile?.affiliate_code
    ? `snapleads.com/${profile.affiliate_code}`
    : `snapleads.com/ref/${t.loading}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${affiliateLink}`);
      setCopied(true);
      toast({
        title: t.dashboard.linkCopied,
        description: t.dashboard.linkCopiedDescription,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        variant: "destructive",
        title: t.dashboard.copyFailed,
        description: t.dashboard.copyFailedDescription,
      });
    }
  };

  return (
    <Card className="border-2 border-border/50 shadow-card overflow-hidden">
      <div className="h-1 bg-brand-gradient" />
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-gradient">
            <Link className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-lg text-foreground">{t.dashboard.yourAffiliateLink}</CardTitle>
            <CardDescription>{t.dashboard.shareToEarn}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-accent/50 p-4">
          <code className="flex-1 text-sm font-medium text-foreground truncate">
            {affiliateLink}
          </code>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="shrink-0 gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-success" />
                {t.copied}
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                {t.copy}
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {t.dashboard.earnCommission}
        </p>
      </CardContent>
    </Card>
  );
};
