export interface League {
    id: string;
    name: string;
    alternateName?: string;
    logoImageUrl?: string;
    bannerImageUrl?: string;
    badgeImageUrl?: string;
}

export interface Team {
    id: string;
    name: string;
    logoUrl?: string;
}

export interface Venue {
    id: string;
    name: string;
    location: string;
    country: string;
    img: string | null;
    coords: {
        lat: number;
        lng: number;
    };
}

export interface Weather {
    timestampUtc: string;
    temperature2m: number;
    apparentTemperature: number;
    rain: number;
    precipitationProbability: number;
    windSpeed10m: number;
    relativeHumidity2m: number;
    weatherCode: number;
}

export interface Analysis {
    id: string;
    analysis: string;
    weatherSnapshot: string;
    favoredTeam: string | null;
    asserted: boolean | null;
    refreshedAt: string;
    lastWeatherRefreshedAt: string;
}

export interface Event {
    id: string;
    eventDateTime: string;
    status: "NOT_STARTED" | "LIVE" | "MATCH_FINISHED";
    league: {
        id: string;
        name: string;
    };
    homeTeam: Team;
    awayTeam: Team;
    score: {
        homeTeamScore: number | null;
        awayTeamScore: number | null;
    };
    venue: Venue;
    weather?: Weather;
    analysis?: Analysis;
}
