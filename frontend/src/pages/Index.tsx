import { Shield, User } from "lucide-react";
import AlertFeed from "@/components/AlertFeed";
import ThreatMapLeaflet from "@/components/ThreatMapLeaflet";
import CommunityRules from "@/components/CommunityRules";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">CROWDSEC</h1>
            </div>
            <div className="flex items-center space-x-4">
              <User className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">YOUR SENTINEL</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Alert Feed */}
          <div className="lg:col-span-1">
            <AlertFeed />
          </div>
          
          {/* Right Column - Threat Map and Community Rules */}
          <div className="lg:col-span-2 space-y-6">
            <ThreatMapLeaflet />
            <CommunityRules />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
