import { useState } from "react";
import Sidebar from "@/components/sidebar";
import OverviewTab from "@/components/overview-tab";
import ApiExplorerTab from "@/components/api-explorer-tab";
import ConfigurationTab from "@/components/configuration-tab";
import WebhooksTab from "@/components/webhooks-tab";
import LogsTab from "@/components/logs-tab";
import { RefreshCw, User } from "lucide-react";
import { Button } from "@/components/ui/button";

type TabType = "overview" | "api-explorer" | "documentation" | "webhooks" | "configuration" | "logs";

interface TabInfo {
  title: string;
  description: string;
}

const tabInfo: Record<TabType, TabInfo> = {
  overview: {
    title: "API Overview",
    description: "Monitor and manage your Shopify Customer Account API integration"
  },
  "api-explorer": {
    title: "API Explorer", 
    description: "Test and explore API endpoints interactively"
  },
  documentation: {
    title: "API Documentation",
    description: "Complete API reference and documentation"
  },
  webhooks: {
    title: "Webhook Management",
    description: "Configure and monitor webhook endpoints"
  },
  configuration: {
    title: "Configuration",
    description: "Manage environment variables and API settings"
  },
  logs: {
    title: "System Logs",
    description: "View system logs and debugging information"
  }
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const renderActiveTab = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab />;
      case "api-explorer":
        return <ApiExplorerTab />;
      case "webhooks":
        return <WebhooksTab />;
      case "configuration":
        return <ConfigurationTab />;
      case "logs":
        return <LogsTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{tabInfo[activeTab].title}</h2>
              <p className="text-sm text-slate-400">{tabInfo[activeTab].description}</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto h-full">
          {renderActiveTab()}
        </div>
      </main>
    </div>
  );
}
