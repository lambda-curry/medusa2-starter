import { Migration } from '@mikro-orm/migrations';

export class Migration20250529215257 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "page_builder_post_section" rename column "name" to "title";`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "page_builder_post_section" rename column "title" to "name";`);
  }

}
