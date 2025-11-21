import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { runSeeders } from 'typeorm-extension';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  private logger = new Logger(SeederService.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async onApplicationBootstrap() {
    // if (process.env.NODE_ENV !== 'production') {
    //   this.logger.log('Skipping seeders (not production)');
    //   return;
    // }

    this.logger.log('Running seeders...');

    await runSeeders(this.dataSource);

    this.logger.log('Seeders completed.');
  }
}
