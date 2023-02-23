export interface Track {
  __typename: string;
  name: string;
  image: string;
  origin: string;
  stats: {
    __typename: string;
    rank: number;
    floor: number;
    vol_24h: number;
    vol_7d: number;
    vol_30d: number;
    vol_total: number;
  };
}
