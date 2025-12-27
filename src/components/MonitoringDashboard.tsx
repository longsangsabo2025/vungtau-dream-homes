import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Activity,
  Database,
  Globe,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  XCircle,
  TrendingUp,
  Users,
  Eye
} from 'lucide-react';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  timestamp: string;
  service: string;
  version: string;
  checks: {
    api: string;
    database: string;
    performance?: string;
  };
}

interface SystemStats {
  totalUsers: number;
  totalProperties: number;
  todayViews: number;
  responseTime: number;
}

export default function MonitoringDashboard() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalProperties: 0,
    todayViews: 0,
    responseTime: 0
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const checkHealth = async () => {
    setLoading(true);
    try {
      const start = Date.now();
      const response = await fetch('/api/health');
      const responseTime = Date.now() - start;
      
      if (response.ok) {
        const data = await response.json();
        setHealth(data);
        setStats(prev => ({ ...prev, responseTime }));
      } else {
        setHealth({
          status: 'down',
          timestamp: new Date().toISOString(),
          service: 'vungtauland',
          version: '1.0.0',
          checks: { api: 'error', database: 'unknown' }
        });
      }
    } catch (error) {
      console.error('Health check failed:', error);
      setHealth({
        status: 'down',
        timestamp: new Date().toISOString(),
        service: 'vungtauland',
        version: '1.0.0',
        checks: { api: 'error', database: 'unknown' }
      });
    }
    setLoading(false);
    setLastUpdate(new Date());
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'ok':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'down':
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'ok':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'degraded':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'down':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Monitoring</h2>
          <p className="text-muted-foreground">
            Real-time health and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </span>
          <Button variant="outline" size="sm" onClick={checkHealth} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {health ? getStatusIcon(health.status) : <Activity className="h-4 w-4" />}
              <span className={`text-2xl font-bold ${health ? getStatusColor(health.status) : ''}`}>
                {health ? health.status.toUpperCase() : 'CHECKING...'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Version: {health?.version || 'Unknown'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Response</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.responseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {health ? getStatusIcon(health.checks.database) : <Activity className="h-4 w-4" />}
              <span className={`text-2xl font-bold ${health ? getStatusColor(health.checks.database) : ''}`}>
                {health ? health.checks.database.toUpperCase() : 'UNKNOWN'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Page views today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Status */}
      <Card>
        <CardHeader>
          <CardTitle>Service Health Details</CardTitle>
          <CardDescription>
            Detailed status of all system components
          </CardDescription>
        </CardHeader>
        <CardContent>
          {health ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(health.checks.api)}
                  <span className="font-medium">API Service</span>
                </div>
                <Badge variant={health.checks.api === 'ok' ? 'default' : 'destructive'}>
                  {health.checks.api.toUpperCase()}
                </Badge>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(health.checks.database)}
                  <span className="font-medium">Database Connection</span>
                </div>
                <Badge variant={health.checks.database === 'ok' ? 'default' : 'destructive'}>
                  {health.checks.database.toUpperCase()}
                </Badge>
              </div>

              <Separator />

              <div className="text-sm text-muted-foreground">
                <strong>Last Check:</strong> {new Date(health.timestamp).toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-8 w-8 mx-auto mb-4 animate-pulse" />
              <p className="text-muted-foreground">Loading system status...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}