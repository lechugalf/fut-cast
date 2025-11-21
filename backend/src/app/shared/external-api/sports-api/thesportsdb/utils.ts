import { ExternalEvent } from '../interfaces/external-event.interface';
import { EventStatus } from '@app/events/events.types';
import { EventRawData, TeamRawData, VenueRawData } from './thesportsdb.types';
import { Team, Venue } from '@app/shared/interfaces';
import { ExternalTeam } from '../interfaces/external-team.interface';
import { ExternalVenue } from '../interfaces/external-venue.interface';

export const parseEventDateTime = (
  event: Partial<EventRawData>,
): Date | null => {
  const dateRaw = event.dateEvent;
  const timeRaw = event.strTime;

  if (!dateRaw || typeof dateRaw !== 'string') {
    return null;
  }

  const dateStr = dateRaw.trim();
  let timeStr =
    timeRaw && typeof timeRaw === 'string' ? timeRaw.trim() : '00:00:00Z';

  const hasTimezone = /([+-]\d{2}:?\d{2}|Z)$/i.test(timeStr);
  if (!hasTimezone) timeStr += 'Z';

  const isoDateTime = `${dateStr}T${timeStr}`;
  const date = new Date(isoDateTime);

  if (isNaN(date.getTime())) {
    // TODO: custom error
    throw new Error(`Invalid event date/time: ${isoDateTime}`);
  }

  return date;
};

export const normalizer = <T, K extends string>(
  res: Record<string, T[] | null | string>,
  resourceName: K,
): { [P in K]: T[] } => {
  if (!(resourceName in res)) {
    throw new Error(`Invalid API response: '${resourceName}' property missing`);
  }

  const resources = res[resourceName];

  if (resources === null) {
    return { [resourceName]: [] as T[] } as { [P in K]: T[] };
  }

  if (typeof resources === 'string') {
    throw new Error(`API returned an error: ${resources}`);
  }
  if (Array.isArray(resources)) {
    return { [resourceName]: resources } as { [P in K]: T[] };
  }

  throw new Error(`Unexpected '${resourceName}' format`);
};

export const parseEventStatus = (event: Partial<EventRawData>): EventStatus => {
  const eventDate = parseEventDateTime(event);
  const status = event.strStatus;

  if (!status || typeof status !== 'string') {
    throw new Error(`Invalid event status: ${status}`);
  }

  switch (status.toLowerCase()) {
    case 'match finished':
      return EventStatus.FINISHED;
    case 'not started':
      return EventStatus.NOT_STARTED;
    case 'in progress':
      return EventStatus.LIVE;
    default: {
      if (eventDate) {
        if (eventDate < new Date()) {
          return EventStatus.FINISHED;
        }
        // TODO: Determine rule to calculate live status.
        return EventStatus.NOT_STARTED;
      }
      throw new Error(`Unknown event status: ${status}`);
    }
  }
};


type Coords = {
  lat: number;
  lng: number;
};

/**
 * Parse coodinates from a string with different formats. Into a Coords object.
 * 
 * Supports the following formats:
 * - Decimal: 43.360783
 * - Decimal+Dir: 43.360783°N
 * - DMS: 39°56′39″N
 * 
 * It throws an error if the input is not a valid coordinate string.
 * 
 * @param input The string to parse.
 * @returns The parsed Coords object.
 */
export function parseCoords(input: string): Coords {
  const trimmedInput = input.trim();

  const parsePart = (part: string): number => {
    const dmsRegex = /(-?\d+(?:\.\d+)?)°\s*(\d+(?:\.\d+)?)?[′']?\s*(\d+(?:\.\d+)?)?[″"]?\s*([NSEOW])?/i;
    const dmsMatch = part.match(dmsRegex);

    if (dmsMatch) {
      const deg = parseFloat(dmsMatch[1]);
      const min = dmsMatch[2] ? parseFloat(dmsMatch[2]) : 0;
      const sec = dmsMatch[3] ? parseFloat(dmsMatch[3]) : 0;
      const dir = dmsMatch[4] ? dmsMatch[4].toUpperCase() : null;

      let decimal = Math.abs(deg) + min / 60 + sec / 3600;

      // Handle negative degrees in input or S/W/O direction
      if (deg < 0 || (dir && ['S', 'W', 'O'].includes(dir))) {
        decimal = -decimal;
      }
      return decimal;
    }

    const decimal = parseFloat(part);
    if (!isNaN(decimal)) {
      return decimal;
    }

    throw new Error(`Could not parse coordinate part: "${part}"`);
  };

  const parts = trimmedInput.split(/[\s,]+/).filter(Boolean);

  if (parts.length !== 2) {
    throw new Error(`Invalid coordinates format: "${input}"`);
  }

  const lat = parsePart(parts[0]);
  const lng = parsePart(parts[1]);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    throw new Error(`Invalid numeric values in coordinates: "${input}"`);
  }

  return { lat, lng };
}

export const mapRawToEvent = (rawEvent: EventRawData): ExternalEvent => {
  const eventDateTime = parseEventDateTime(rawEvent);

  if (!eventDateTime) {
    throw new Error(`Invalid event date: ${eventDateTime}`);
  }

  const status = parseEventStatus(rawEvent);

  if (!status) {
    throw new Error(`Invalid event status: ${rawEvent.strStatus}`);
  }

  const homeScore =
    typeof rawEvent.intHomeScore === 'string'
      ? parseInt(rawEvent.intHomeScore)
      : null;

  const awayScore =
    typeof rawEvent.intAwayScore === 'string'
      ? parseInt(rawEvent.intAwayScore)
      : null;

  return {
    externalId: rawEvent.idEvent,
    eventDateTime,
    status,
    externalLeagueId: rawEvent.idLeague,
    externalHomeTeamId: rawEvent.idHomeTeam,
    externalAwayTeamId: rawEvent.idAwayTeam,
    externalAwayTeamName: rawEvent.strAwayTeam,
    externalHomeTeamName: rawEvent.strHomeTeam,
    homeScore,
    awayScore,
    externalVenueId: rawEvent.idVenue,
  };
};

export const mapRawToTeam = (rawTeam: TeamRawData): ExternalTeam => {
  return {
    externalId: rawTeam.idTeam,
    name: rawTeam.strTeam,
    alternateName: rawTeam.strTeamAlternate,
    shortName: rawTeam.strTeamShort,
    logoImageUrl: rawTeam.strLogo,
    badgeImageUrl: rawTeam.strBadge,
    venueExternalId: rawTeam.idVenue,
  };
};

export const mapRawToVenue = (rawVenue: VenueRawData): ExternalVenue => {
  const coords = parseCoords(rawVenue.strMap);

  return {
    strThumb: rawVenue.strThumb,
    externalId: rawVenue.idVenue,
    name: rawVenue.strVenue,
    country: rawVenue.strCountry,
    location: rawVenue.strLocation,
    rawTimezone: rawVenue.strTimezone,
    coords,
  };
};
