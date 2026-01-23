import { Users } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Leads = () => {
  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Leads</h1>
          <p className="mt-1 text-muted-foreground">
            Track and manage all your referred leads.
          </p>
        </div>

        <Card className="border-border/50 shadow-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Lead Management</CardTitle>
                <CardDescription>Coming soon in Phase 2</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex min-h-[300px] items-center justify-center rounded-lg border-2 border-dashed border-border bg-accent/30">
              <div className="text-center">
                <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-lg font-medium text-muted-foreground">
                  Lead tracking will be available soon
                </p>
                <p className="mt-2 text-sm text-muted-foreground/70">
                  View conversion rates, lead status, and more
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Leads;
