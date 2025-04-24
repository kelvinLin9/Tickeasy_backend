import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1745483872802 implements MigrationInterface {
    name = 'InitialMigration1745483872802'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('user', 'admin', 'superuser')`);
        await queryRunner.query(`CREATE TYPE "public"."users_gender_enum" AS ENUM('male', 'female', 'other')`);
        await queryRunner.query(`CREATE TABLE "users" ("userId" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(100) NOT NULL, "password" character varying(50), "name" character varying(50) NOT NULL, "nickname" character varying(20), "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', "phone" character varying(20), "birthday" date, "gender" "public"."users_gender_enum", "preferredRegions" character varying array DEFAULT '{}', "preferredEventTypes" character varying array DEFAULT '{}', "country" character varying(20), "address" character varying(100), "avatar" character varying(255), "verificationToken" character varying(50), "verificationTokenExpires" TIMESTAMP, "isEmailVerified" boolean NOT NULL DEFAULT false, "passwordResetToken" character varying(50), "passwordResetExpires" TIMESTAMP, "lastVerificationAttempt" TIMESTAMP, "lastPasswordResetAttempt" TIMESTAMP, "oauthProviders" jsonb NOT NULL DEFAULT '[]', "searchHistory" jsonb DEFAULT '[]', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_8bf09ba754322ab9c22a215c919" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`CREATE INDEX "IDX_ace513fa30d485cfd25c11a9e4" ON "users" ("role") `);
        await queryRunner.query(`CREATE TABLE "organization" ("organizationId" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "orgName" character varying(100) NOT NULL, "orgAddress" character varying(100) NOT NULL, "orgMail" character varying(100), "orgContact" character varying(1000), "orgMobile" character varying(200), "orgPhone" character varying(200), "orgWebsite" character varying(200), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7867970695572b3f6561516414d" PRIMARY KEY ("organizationId"))`);
        await queryRunner.query(`CREATE TABLE "venues" ("venueId" uuid NOT NULL DEFAULT uuid_generate_v4(), "venueName" character varying(100) NOT NULL, "venueDescription" text, "venueAddress" character varying(200) NOT NULL, "venueCapacity" integer, "venueImageUrl" character varying(255), "googleMapUrl" character varying(255), "isAccessible" boolean NOT NULL DEFAULT false, "hasParking" boolean NOT NULL DEFAULT false, "hasTransit" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_57b9556731ee08376830177b81f" PRIMARY KEY ("venueId"))`);
        await queryRunner.query(`CREATE TABLE "locationTag" ("locationTagId" uuid NOT NULL DEFAULT uuid_generate_v4(), "locationTagName" character varying(50) NOT NULL, CONSTRAINT "PK_7c942cbe282554eebae2d58c71d" PRIMARY KEY ("locationTagId"))`);
        await queryRunner.query(`CREATE TABLE "musicTag" ("musicTagId" uuid NOT NULL DEFAULT uuid_generate_v4(), "musicTagName" character varying(50) NOT NULL, CONSTRAINT "PK_128deaeb1ae47f8d77e6f7f19a3" PRIMARY KEY ("musicTagId"))`);
        await queryRunner.query(`CREATE TYPE "public"."concert_reviewstatus_enum" AS ENUM('pending', 'approved', 'rejected', 'skipped')`);
        await queryRunner.query(`CREATE TABLE "concert" ("concertId" uuid NOT NULL DEFAULT uuid_generate_v4(), "organizationId" uuid NOT NULL, "venueId" uuid, "locationTagId" uuid NOT NULL, "musicTagId" uuid NOT NULL, "conTitle" character varying(50) NOT NULL, "conIntroduction" character varying(3000), "conLocation" character varying(50) NOT NULL, "conAddress" character varying(200) NOT NULL, "eventStartDate" date, "eventEndDate" date, "imgBanner" character varying(255) NOT NULL, "imgSeattable" character varying(255) NOT NULL, "ticketPurchaseMethod" character varying(1000) NOT NULL, "precautions" character varying(2000) NOT NULL, "refundPolicy" character varying(1000) NOT NULL, "conInfoStatus" character varying(10), "conStatus" character varying(10), "reviewStatus" "public"."concert_reviewstatus_enum" NOT NULL DEFAULT 'skipped', "visitCount" integer, "promotion" integer, "cancelledAt" TIMESTAMP, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_367869ca08bcc5b0c86421f5f24" PRIMARY KEY ("concertId"))`);
        await queryRunner.query(`CREATE TABLE "ticketType" ("ticketTypeId" uuid NOT NULL DEFAULT uuid_generate_v4(), "concertId" uuid NOT NULL, "ticketTypeName" character varying(50) NOT NULL, "entranceType" character varying(50), "ticketBenefits" text, "ticketRefundPolicy" text, "ticketTypePrice" numeric(10,2) NOT NULL, "totalQuantity" integer NOT NULL, "remainingQuantity" integer NOT NULL, "sellBeginDate" TIMESTAMP, "sellEndDate" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_81afbd1b45403e4f8217139daeb" PRIMARY KEY ("ticketTypeId"))`);
        await queryRunner.query(`CREATE TABLE "order" ("orderId" uuid NOT NULL DEFAULT uuid_generate_v4(), "ticketTypeId" uuid NOT NULL, "userId" uuid, "orderStatus" character varying(20) NOT NULL, "isLocked" boolean NOT NULL DEFAULT true, "lockToken" character varying(100) NOT NULL, "lockExpireTime" TIMESTAMP NOT NULL, "purchaserName" character varying(50), "purchaserEmail" character varying(100), "purchaserPhone" character varying(50), "invoicePlatform" character varying(20), "invoiceType" character varying(20), "invoiceCarrier" character varying(100), "invoiceStatus" character varying(20), "invoiceNumber" character varying(20), "invoiceUrl" character varying(255), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_b075313d4d7e1c12f1a6e6359e8" PRIMARY KEY ("orderId"))`);
        await queryRunner.query(`CREATE TABLE "payment" ("paymentId" uuid NOT NULL DEFAULT uuid_generate_v4(), "orderId" uuid NOT NULL, "method" character varying(50) NOT NULL, "provider" character varying(50), "status" character varying(20) NOT NULL, "amount" numeric(10,2) NOT NULL, "currency" character varying(10) NOT NULL DEFAULT 'TWD', "paidAt" TIMESTAMP, "transactionId" character varying(100), "rawPayload" json, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_67ee4523b649947b6a7954dc673" PRIMARY KEY ("paymentId"))`);
        await queryRunner.query(`CREATE TABLE "concertSession" ("sessionId" uuid NOT NULL DEFAULT uuid_generate_v4(), "concertId" uuid NOT NULL, "sessionDate" date NOT NULL, "sessionStart" TIME NOT NULL, "sessionEnd" TIME, "sessionTitle" character varying(100), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_777b5a081c2928b81ac48601882" PRIMARY KEY ("sessionId"))`);
        await queryRunner.query(`CREATE TABLE "ticket" ("ticketId" uuid NOT NULL DEFAULT uuid_generate_v4(), "orderId" uuid NOT NULL, "ticketTypeId" uuid NOT NULL, "userId" uuid, "purchaserName" character varying(100), "purchaserEmail" character varying(100), "concertStartTime" TIMESTAMP NOT NULL, "seatNumber" character varying(20), "qrCode" character varying(255), "status" character varying(20) NOT NULL, "purchaseTime" TIMESTAMP NOT NULL, CONSTRAINT "PK_d7f0cf291bf98aaea42f73ad92f" PRIMARY KEY ("ticketId"))`);
        await queryRunner.query(`ALTER TABLE "organization" ADD CONSTRAINT "FK_b0d30285f6775593196167e2016" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "concert" ADD CONSTRAINT "FK_30c544cde81f6c376020c0f5b90" FOREIGN KEY ("organizationId") REFERENCES "organization"("organizationId") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "concert" ADD CONSTRAINT "FK_b8c97e75c80a18f687bbaa72871" FOREIGN KEY ("venueId") REFERENCES "venues"("venueId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "concert" ADD CONSTRAINT "FK_21bd010735c7e4adc27ff46d697" FOREIGN KEY ("locationTagId") REFERENCES "locationTag"("locationTagId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "concert" ADD CONSTRAINT "FK_a52c799209e63921d3e5e32e5ae" FOREIGN KEY ("musicTagId") REFERENCES "musicTag"("musicTagId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ticketType" ADD CONSTRAINT "FK_f2d0f3c34846fca41a586b83852" FOREIGN KEY ("concertId") REFERENCES "concert"("concertId") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_36369a70c27d63a464ebf2c8599" FOREIGN KEY ("ticketTypeId") REFERENCES "ticketType"("ticketTypeId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_caabe91507b3379c7ba73637b84" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_d09d285fe1645cd2f0db811e293" FOREIGN KEY ("orderId") REFERENCES "order"("orderId") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "concertSession" ADD CONSTRAINT "FK_5d96d235356b939822ad3c5f732" FOREIGN KEY ("concertId") REFERENCES "concert"("concertId") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ticket" ADD CONSTRAINT "FK_8f4c2f0a2877e526e8881b51464" FOREIGN KEY ("orderId") REFERENCES "order"("orderId") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ticket" ADD CONSTRAINT "FK_7061359da242fbf565771953137" FOREIGN KEY ("ticketTypeId") REFERENCES "ticketType"("ticketTypeId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ticket" ADD CONSTRAINT "FK_0e01a7c92f008418bad6bad5919" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ticket" DROP CONSTRAINT "FK_0e01a7c92f008418bad6bad5919"`);
        await queryRunner.query(`ALTER TABLE "ticket" DROP CONSTRAINT "FK_7061359da242fbf565771953137"`);
        await queryRunner.query(`ALTER TABLE "ticket" DROP CONSTRAINT "FK_8f4c2f0a2877e526e8881b51464"`);
        await queryRunner.query(`ALTER TABLE "concertSession" DROP CONSTRAINT "FK_5d96d235356b939822ad3c5f732"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_d09d285fe1645cd2f0db811e293"`);
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_caabe91507b3379c7ba73637b84"`);
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_36369a70c27d63a464ebf2c8599"`);
        await queryRunner.query(`ALTER TABLE "ticketType" DROP CONSTRAINT "FK_f2d0f3c34846fca41a586b83852"`);
        await queryRunner.query(`ALTER TABLE "concert" DROP CONSTRAINT "FK_a52c799209e63921d3e5e32e5ae"`);
        await queryRunner.query(`ALTER TABLE "concert" DROP CONSTRAINT "FK_21bd010735c7e4adc27ff46d697"`);
        await queryRunner.query(`ALTER TABLE "concert" DROP CONSTRAINT "FK_b8c97e75c80a18f687bbaa72871"`);
        await queryRunner.query(`ALTER TABLE "concert" DROP CONSTRAINT "FK_30c544cde81f6c376020c0f5b90"`);
        await queryRunner.query(`ALTER TABLE "organization" DROP CONSTRAINT "FK_b0d30285f6775593196167e2016"`);
        await queryRunner.query(`DROP TABLE "ticket"`);
        await queryRunner.query(`DROP TABLE "concertSession"`);
        await queryRunner.query(`DROP TABLE "payment"`);
        await queryRunner.query(`DROP TABLE "order"`);
        await queryRunner.query(`DROP TABLE "ticketType"`);
        await queryRunner.query(`DROP TABLE "concert"`);
        await queryRunner.query(`DROP TYPE "public"."concert_reviewstatus_enum"`);
        await queryRunner.query(`DROP TABLE "musicTag"`);
        await queryRunner.query(`DROP TABLE "locationTag"`);
        await queryRunner.query(`DROP TABLE "venues"`);
        await queryRunner.query(`DROP TABLE "organization"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ace513fa30d485cfd25c11a9e4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_gender_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
