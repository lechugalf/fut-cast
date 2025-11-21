import { EventStatus } from "../events.types";

export type VenueDto = {
  id: string;
  name: string;
  location: string;
  country: string;
  img: string | null;
  coords: {
    lat: number;
    lng: number;
  }
}

export type TeamDto = {
  id: string;
  name: string;
}

export type LeagueDto = {
  id: string;
  name: string;
}

export interface EventDto {
  id: string;
  status: EventStatus;
  eventDateTime: Date;
  league: LeagueDto;
  homeTeam: TeamDto;
  awayTeam: TeamDto;
  score: {
    homeTeamScore: number | null;
    awayTeamScore: number | null;
  };
  venue?: VenueDto;
};


