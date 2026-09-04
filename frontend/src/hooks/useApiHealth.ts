import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { VersionResponse } from '../types/api';

export interface ApiHealthState {
  status: 'connected' | 'checking' | 'disconnected';
  versionInfo: VersionResponse | null;
  error: string | null;
  lastChecked: Date | null;
  checkNow: () => Promise<void>;
}

export function useApiHealth(): ApiHealthState {
  const [status, setStatus] = useState<'connected' | 'checking' | 'disconnected'>('checking');
  const [versionInfo, setVersionInfo] = useState<VersionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkNow = async () => {
    setStatus('checking');
    try {
      const healthRes = await apiClient.checkHealth();
      if (healthRes.status === 'healthy') {
        const verRes = await apiClient.getVersion();
        setVersionInfo(verRes);
        setStatus('connected');
        setError(null);
      } else {
        setStatus('disconnected');
        setError(`Unexpected health response: ${healthRes.status}`);
      }
    } catch (err: any) {
      setStatus('disconnected');
      setError(err.message || 'Unable to connect to backend service');
      setVersionInfo(null);
    } finally {
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    checkNow();
    const interval = setInterval(checkNow, 20000);
    return () => clearInterval(interval);
  }, []);

  return {
    status,
    versionInfo,
    error,
    lastChecked,
    checkNow,
  };
}
