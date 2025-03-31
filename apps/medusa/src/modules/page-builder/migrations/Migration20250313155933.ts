import { Migration } from '@mikro-orm/migrations';

export class Migration20250313155933 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "post" alter column "handle" type text using ("handle"::text);`);
    this.addSql(`alter table if exists "post" alter column "handle" drop not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "post" alter column "handle" type text using ("handle"::text);`);
    this.addSql(`alter table if exists "post" alter column "handle" set not null;`);
  }

}
