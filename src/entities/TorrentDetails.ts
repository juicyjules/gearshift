import { type Torrent } from "../transmission-rpc/types";
export const TorrentDetailFields = [
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
  'comment',
  'creator',
  'dateCreated',
  'files',
  'fileStats',
  'trackers',
  'trackerStats',
  'magnetLink',
  'downloadDir',
  'uploadedEver',
  'downloadedEver'
] as const;

export type TorrentDetails = Pick<Torrent, typeof TorrentDetailFields[number]>;