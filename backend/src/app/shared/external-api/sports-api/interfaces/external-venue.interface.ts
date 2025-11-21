export interface ExternalVenue {
    externalId: string;
    name: string;

    // Location details
    country: string;
    location: string;
    rawTimezone: string;
    strThumb: string;
    coords: {
        lat: number;
        lng: number;
    };
}
