import { type Torrent } from "../transmission-rpc/types";
export const TorrentDetailFields = [
  'id',
  'name',
  'percentDone',
  'status',
  'rateDownload',
  'errorString',
] as const;

export type TorrentDetails = Pick<Torrent, typeof TorrentDetailFields[number]>;