import { Injectable } from '@nestjs/common';
import { SportsApi } from './sports-api.abstract';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class SportsDBService implements SportsApi {
  constructor(private readonly httpService: HttpService) {}

  async getEventsByLeague(leagueId: string): Promise<any[]> {
    console.log('Llamando a la API real de TheSportsDB...', leagueId);

    return [{ id: '123', name: 'Partido de TheSportsDB' }];
  }

  async getEventById(eventId: string): Promise<any> {
    // Lógica de Axios para buscar detalles...
    return { id: eventId, detail: '...' };
  }
}
