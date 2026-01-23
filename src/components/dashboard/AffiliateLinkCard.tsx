import { useState } from "react";
import { motion } from "framer-motion";
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Card className="border-2 border-border/50 shadow-card overflow-hidden">
        <div className="h-1 bg-brand-gradient" />
        <CardHeader className="px-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <motion.div 
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-gradient"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Link className="h-5 w-5 text-primary-foreground" />
            </motion.div>
            <div>
              <CardTitle className="text-base sm:text-lg text-foreground">{t.dashboard.yourAffiliateLink}</CardTitle>
              <CardDescription className="text-sm">{t.dashboard.shareToEarn}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center rounded-lg border border-border bg-accent/50 p-3 sm:p-4">
            <code className="flex-1 text-xs sm:text-sm font-medium text-foreground break-all">
              {affiliateLink}
            </code>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="w-full sm:w-auto shrink-0 gap-2"
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
            </motion.div>
          </div>
          <p className="text-xs text-muted-foreground">
            {t.dashboard.earnCommission}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};
