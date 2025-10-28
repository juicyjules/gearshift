import { type Torrent } from "../transmission-rpc/types";
export const TorrentOverviewFields = [
  'id',
  'name',
  'percentDone',
  'status',
  'rateDownload',
  'rateUpload',
  'eta',
  'errorString',
  'totalSize',
  'uploadRatio',
  "peersSendingToUs",
"peersGettingFromUs",
] as const;

export type TorrentOverview = Pick<Torrent, typeof TorrentOverviewFields[number]>;