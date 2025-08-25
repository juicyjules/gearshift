import { TorrentStatus } from '../transmission-rpc/types';

export const getTorrentStatusText = (status: TorrentStatus): string => {
  const statusMap: Record<TorrentStatus, string> = {
    [TorrentStatus.Stopped]: 'Stopped',
    [TorrentStatus.QueuedToVerify]: 'Check wait',
    [TorrentStatus.Verifying]: 'Checking',
    [TorrentStatus.QueuedToDownload]: 'Download wait',
    [TorrentStatus.Downloading]: 'Downloading',
    [TorrentStatus.QueuedToSeed]: 'Seed wait',
    [TorrentStatus.Seeding]: 'Seeding',
  };
  return statusMap[status] || 'Unknown';
};

export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const formatEta = (eta: number): string => {
  if (eta < 0) return '∞';
  if (eta === 0) return 'Done';

  const d = Math.floor(eta / 86400);
  const h = Math.floor((eta % 86400) / 3600);
  const m = Math.floor((eta % 3600) / 60);

  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);

  return parts.join(' ') || '< 1m';
};
