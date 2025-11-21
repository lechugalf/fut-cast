import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1763757502487 implements MigrationInterface {
    name = 'InitialMigration1763757502487'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE event_status_enum AS ENUM ('NOT_STARTED', 'LIVE', 'MATCH_FINISHED');`);
        await queryRunner.query(`CREATE TABLE "venue" ("id" character varying(26) NOT NULL, "externalId" text NOT NULL, "name" text NOT NULL, "country" text NOT NULL, "location" text NOT NULL, "rawTimezone" text NOT NULL, "latitude" double precision NOT NULL, "longitude" double precision NOT NULL, "thumbnailUrl" text, "rawSportsDBData" jsonb, CONSTRAINT "UQ_b458067881a9e8c18ae40e30a25" UNIQUE ("externalId"), CONSTRAINT "PK_c53deb6d1bcb088f9d459e7dbc0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "weather_hourly" ("id" character varying(26) NOT NULL, "timestampUtc" TIMESTAMP NOT NULL, "precipitation" double precision, "precipitationProbability" integer, "rain" double precision, "showers" double precision, "snowfall" double precision, "weatherCode" integer, "temperature2m" double precision, "relativeHumidity2m" integer, "dewPoint2m" double precision, "apparentTemperature" double precision, "windSpeed10m" double precision, "refreshedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "venueId" character varying(26), CONSTRAINT "PK_97f237384d1f399375909a9db8c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "team" ("id" character varying(26) NOT NULL, "externalId" character varying NOT NULL, "name" text NOT NULL, "venueId" character varying, "alternateName" text, "shortName" text, "logoImageUrl" text, "badgeImageUrl" text, "refreshedAt" TIMESTAMP NOT NULL DEFAULT now(), "rawSportsDBData" jsonb, CONSTRAINT "UQ_0bde0a4c93ed2fea71684c1e47a" UNIQUE ("externalId"), CONSTRAINT "PK_f57d8293406df4af348402e4b74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "league" ("id" character varying(26) NOT NULL, "externalId" character varying NOT NULL, "name" text NOT NULL, "alternateName" text NOT NULL, "logoImageUrl" text NOT NULL, "bannerImageUrl" text NOT NULL, "badgeImageUrl" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "UQ_49aa962005ddcdf2ce8860fe4c8" UNIQUE ("externalId"), CONSTRAINT "PK_0bd74b698f9e28875df738f7864" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "analysis_result" ("id" character varying NOT NULL, "analysis" text NOT NULL, "prompt" text NOT NULL, "weatherSnapshot" text NOT NULL, "lastWeatherRefreshedAt" TIMESTAMP WITH TIME ZONE, "asserted" boolean, "refreshedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "eventId" character varying(26), "favoredTeamId" character varying(26), CONSTRAINT "REL_2a367edf33205a6bf6dcfcb6bf" UNIQUE ("eventId"), CONSTRAINT "PK_95eb6bd0f9c277efae60ce4e39a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "event" ("id" character varying(26) NOT NULL, "externalId" text NOT NULL, "eventDateTime" TIMESTAMP WITH TIME ZONE NOT NULL, "leagueId" character varying NOT NULL, "homeTeamId" character varying, "awayTeamId" character varying, "homeScore" smallint, "awayScore" smallint, "venueId" character varying, "status" "public"."event_status_enum" NOT NULL DEFAULT 'NOT_STARTED', "refreshedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "nextRefreshAt" TIMESTAMP WITH TIME ZONE, "locked" boolean NOT NULL, "rawSportsDBData" jsonb, CONSTRAINT "UQ_a1f536d8bc19c15183f8f3ca2fc" UNIQUE ("externalId"), CONSTRAINT "PK_30c2f3bbaf6d34a55f8ae6e4614" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "weather_hourly" ADD CONSTRAINT "FK_13cc83f14ca03d95dfec8ff113f" FOREIGN KEY ("venueId") REFERENCES "venue"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team" ADD CONSTRAINT "FK_26967bba4dff4327357afd20c24" FOREIGN KEY ("venueId") REFERENCES "venue"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "analysis_result" ADD CONSTRAINT "FK_2a367edf33205a6bf6dcfcb6bf4" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "analysis_result" ADD CONSTRAINT "FK_b04b6c05e6c7cd12e2fac5712eb" FOREIGN KEY ("favoredTeamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event" ADD CONSTRAINT "FK_da2f252a3de71994cc9141e12e6" FOREIGN KEY ("leagueId") REFERENCES "league"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event" ADD CONSTRAINT "FK_72d061c4ac7a12236554ffd80c5" FOREIGN KEY ("homeTeamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event" ADD CONSTRAINT "FK_ce428c195ed1be6f95e6d9fa895" FOREIGN KEY ("awayTeamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event" ADD CONSTRAINT "FK_0a7a72120769940b25f994863c7" FOREIGN KEY ("venueId") REFERENCES "venue"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event" DROP CONSTRAINT "FK_0a7a72120769940b25f994863c7"`);
        await queryRunner.query(`ALTER TABLE "event" DROP CONSTRAINT "FK_ce428c195ed1be6f95e6d9fa895"`);
        await queryRunner.query(`ALTER TABLE "event" DROP CONSTRAINT "FK_72d061c4ac7a12236554ffd80c5"`);
        await queryRunner.query(`ALTER TABLE "event" DROP CONSTRAINT "FK_da2f252a3de71994cc9141e12e6"`);
        await queryRunner.query(`ALTER TABLE "analysis_result" DROP CONSTRAINT "FK_b04b6c05e6c7cd12e2fac5712eb"`);
        await queryRunner.query(`ALTER TABLE "analysis_result" DROP CONSTRAINT "FK_2a367edf33205a6bf6dcfcb6bf4"`);
        await queryRunner.query(`ALTER TABLE "team" DROP CONSTRAINT "FK_26967bba4dff4327357afd20c24"`);
        await queryRunner.query(`ALTER TABLE "weather_hourly" DROP CONSTRAINT "FK_13cc83f14ca03d95dfec8ff113f"`);
        await queryRunner.query(`DROP TABLE "event"`);
        await queryRunner.query(`DROP TABLE "analysis_result"`);
        await queryRunner.query(`DROP TABLE "league"`);
        await queryRunner.query(`DROP TABLE "team"`);
        await queryRunner.query(`DROP TABLE "weather_hourly"`);
        await queryRunner.query(`DROP TABLE "venue"`);
    }

}
