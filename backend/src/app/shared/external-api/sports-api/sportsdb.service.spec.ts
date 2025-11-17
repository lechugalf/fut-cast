import { Test, TestingModule } from '@nestjs/testing';
import { SportsdbService } from './sportsdb.service';

describe('SportsdbService', () => {
  let service: SportsdbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SportsdbService],
    }).compile();

    service = module.get<SportsdbService>(SportsdbService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
