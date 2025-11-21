export interface ExternalVenue {
    externalId: string;
    name: string;

    // Location details
    country: string;
    location: string;
    rawTimezone: string;
    coords: {
        lat: number;
        lng: number;
    };
}
