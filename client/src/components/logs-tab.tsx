import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface ApiLog {
  id: string;
  method: string;
  endpoint: string;
  statusCode: number;
  responseTime: number;
  level: string;
  message: string;
  timestamp: string;
}

export default function LogsTab() {
  const [levelFilter, setLevelFilter] = useState("all");

  const { data: logs, isLoading } = useQuery<ApiLog[]>({
    queryKey: ["/api/logs"],
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
  };

  const filteredLogs = logs?.filter(log => 
    levelFilter === "all" || log.level.toLowerCase() === levelFilter.toLowerCase()
  ) || [];

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "error":
        return "bg-red-500/20 text-red-500";
      case "warn":
      case "warning":
        return "bg-yellow-500/20 text-yellow-500";
      case "info":
        return "bg-secondary/20 text-secondary";
      case "debug":
        return "bg-blue-500/20 text-blue-500";
      default:
        return "bg-slate-500/20 text-slate-400";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="bg-slate-900 rounded-lg p-4 h-96">
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex space-x-3">
                    <div className="h-4 bg-slate-700 rounded w-24"></div>
                    <div className="h-4 bg-slate-700 rounded w-16"></div>
                    <div className="h-4 bg-slate-700 rounded flex-1"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>System Logs</CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm h-96 overflow-y-auto">
          {filteredLogs.length > 0 ? (
            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <div key={log.id} className="flex items-start space-x-3">
                  <span className="text-slate-500 whitespace-nowrap">
                    {formatTimestamp(log.timestamp)}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs ${getLevelColor(log.level)}`}>
                    {log.level.toUpperCase()}
                  </span>
                  <span className="text-slate-300 flex-1">
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              {levelFilter === "all" ? "No logs available" : `No ${levelFilter} logs found`}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
