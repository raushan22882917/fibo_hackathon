import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getApiStatus, testApiConnection } from '@/config/api';
import { Wifi, WifiOff, RefreshCw, X } from 'lucide-react';

const ApiStatus: React.FC = () => {
  const [status, setStatus] = useState<{
    url: string;
    isConnected: boolean;
    isProduction: boolean;
  } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkStatus = async () => {
    setIsLoading(true);
    try {
      const apiStatus = await getApiStatus();
      setStatus(apiStatus);
    } catch (error) {
      console.error('Failed to check API status:', error);
      setStatus({
        url: 'Unknown',
        isConnected: false,
        isProduction: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  if (!status) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Badge variant="secondary" className="text-xs">
          Checking API...
        </Badge>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isExpanded ? (
        <Card className="w-80 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              API Status
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              {status.isConnected ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm">
                {status.isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            <div>
              <div className="text-xs text-gray-500">Environment:</div>
              <div className="text-sm font-mono">
                {status.isProduction ? 'Production' : 'Local'}
              </div>
            </div>
            
            <div>
              <div className="text-xs text-gray-500">URL:</div>
              <div className="text-xs font-mono break-all">
                {status.url}
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={checkStatus}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3 mr-2" />
              )}
              Test Connection
            </Button>
            
            {!status.isConnected && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                <strong>Connection Failed</strong>
                <br />
                • Check if backend server is running
                <br />
                • Verify CORS configuration
                <br />
                • Check network connectivity
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Badge 
          variant={status.isConnected ? (status.isProduction ? "default" : "secondary") : "destructive"}
          className="text-xs cursor-pointer"
          onClick={() => setIsExpanded(true)}
        >
          {status.isConnected ? (
            <Wifi className="w-3 h-3 mr-1" />
          ) : (
            <WifiOff className="w-3 h-3 mr-1" />
          )}
          API: {status.isProduction ? 'Production' : 'Local'}
        </Badge>
      )}
    </div>
  );
};

export default ApiStatus;