import { Team } from '.';

export interface League {
  id: string;
  externalId: string;

  // Name formats
  name: string;
  alternateName: string;

  // Image URLs
  logoImageUrl: string;
  bannerImageUrl: string;
  badgeImageUrl: string;

  // Teams
  teams?: Team[];
}
