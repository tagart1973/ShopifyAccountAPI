import { Store, Gauge, Code, Book, Zap, Settings, Terminal } from "lucide-react";

type TabType = "overview" | "api-explorer" | "documentation" | "webhooks" | "configuration" | "logs";

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const navItems = [
  { id: "overview" as TabType, label: "Overview", icon: Gauge },
  { id: "api-explorer" as TabType, label: "API Explorer", icon: Code },
  { id: "documentation" as TabType, label: "Documentation", icon: Book },
  { id: "webhooks" as TabType, label: "Webhooks", icon: Zap },
  { id: "configuration" as TabType, label: "Configuration", icon: Settings },
  { id: "logs" as TabType, label: "Logs", icon: Terminal },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Store className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Shopify API</h1>
            <p className="text-xs text-slate-400">Customer Account Backend</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-2 text-sm text-slate-400">
          <div className="w-2 h-2 bg-secondary rounded-full"></div>
          <span>Server Online</span>
        </div>
        <div className="text-xs text-slate-500 mt-1">Port 5000 • v1.2.3</div>
      </div>
    </aside>
  );
}
