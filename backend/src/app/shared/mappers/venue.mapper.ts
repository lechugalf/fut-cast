import { Venue } from '../interfaces';
import { Venue as VenueEntity } from '../entities/venue.entity';

export class VenueMapper {
  static toVenue(entity: VenueEntity): Venue {
    return {
      id: entity.id,
      externalId: entity.externalId,
      name: entity.name,
      country: entity.country,
      location: entity.location,
      rawTimezone: entity.rawTimezone,
      coords: {
        lat: entity.latitude,
        lng: entity.longitude,
      },
    };
  }
}
