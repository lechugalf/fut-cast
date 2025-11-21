import { Venue } from './venue.interface';

export interface Team {
  id: string;
  externalId: string;

  // Name formats
  name: string;
  alternateName?: string | null;
  shortName?: string | null;

  // Image URLs
  logoImageUrl?: string | null;
  badgeImageUrl?: string | null;

  // Venue
  venueId?: string | null;
  venue?: Venue;
}
