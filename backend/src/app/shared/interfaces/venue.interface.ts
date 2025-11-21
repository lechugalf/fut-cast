export interface Venue {
  id?: string;
  externalId: string;
  name: string;
  img: string | null;
  // Location details
  country: string;
  location: string;
  rawTimezone: string;
  coords: {
    lat: number;
    lng: number;
  };
}
