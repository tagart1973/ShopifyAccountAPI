import { useQuery } from "@tanstack/react-query";
import { Activity, Zap, Database, Clock, TrendingUp, TrendingDown, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Stats {
  apiRequests: number;
  activeWebhooks: number;
  cacheHitRate: string;
  avgResponseTime: string;
}

interface ApiLog {
  id: string;
  method: string;
  endpoint: string;
  statusCode: number;
  responseTime: number;
  timestamp: string;
}

export default function OverviewTab() {
  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const { data: recentLogs, isLoading: logsLoading } = useQuery<ApiLog[]>({
    queryKey: ["/api/logs"],
  });

  if (statsLoading || logsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-slate-700 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-slate-700 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const recentApiCalls = recentLogs?.slice(0, 5) || [];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">API Requests</p>
                <p className="text-2xl font-bold text-white">{stats?.apiRequests.toLocaleString() || 0}</p>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <TrendingUp className="w-4 h-4 text-secondary mr-1" />
              <span className="text-secondary">12.5%</span>
              <span className="text-slate-400 ml-1">from last hour</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Webhooks</p>
                <p className="text-2xl font-bold text-white">{stats?.activeWebhooks || 0}</p>
              </div>
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-secondary" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <Check className="w-4 h-4 text-secondary mr-1" />
              <span className="text-slate-400">All operational</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Cache Hit Rate</p>
                <p className="text-2xl font-bold text-white">{stats?.cacheHitRate || "0%"}</p>
              </div>
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-accent" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <TrendingUp className="w-4 h-4 text-secondary mr-1" />
              <span className="text-secondary">2.1%</span>
              <span className="text-slate-400 ml-1">improved</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Avg Response</p>
                <p className="text-2xl font-bold text-white">{stats?.avgResponseTime || "0ms"}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <TrendingDown className="w-4 h-4 text-secondary mr-1" />
              <span className="text-secondary">8ms</span>
              <span className="text-slate-400 ml-1">faster</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-4">
            <CardTitle>Recent API Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentApiCalls.length > 0 ? (
                recentApiCalls.map((call) => (
                  <div key={call.id} className="flex items-center justify-between py-3 border-b border-slate-700 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        call.statusCode < 400 ? "bg-secondary" : "bg-red-500"
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium">{call.method} {call.endpoint}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(call.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        call.statusCode < 400 
                          ? "bg-secondary/20 text-secondary"
                          : "bg-red-500/20 text-red-500"
                      }`}>
                        {call.statusCode}
                      </span>
                      <span className="text-xs text-slate-400">{call.responseTime}ms</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  No recent API calls
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-4">
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">API Server</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span className="text-sm text-secondary">Healthy</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Database Connection</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span className="text-sm text-secondary">Connected</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Redis Cache</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span className="text-sm text-secondary">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Shopify API</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span className="text-sm text-secondary">Connected</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Memory Usage</span>
                <span className="text-sm text-slate-300">342 MB / 1 GB</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "34%" }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
