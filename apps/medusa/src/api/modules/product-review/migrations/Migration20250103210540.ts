import { Migration } from '@mikro-orm/migrations';

export class Migration20250103210540 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table if not exists "product_review" ("id" text not null, "name" text null, "email" text null, "rating" integer not null, "content" text null, "order_item_id" text null, "product_id" text null, "order_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_review_pkey" primary key ("id"));');
    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_product_review_product_id" ON "product_review" (product_id) WHERE deleted_at IS NULL;');

    this.addSql('create table if not exists "product_review_image" ("id" text not null, "url" text not null, "product_review_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_review_image_pkey" primary key ("id"));');
    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_product_review_image_product_review_id" ON "product_review_image" (product_review_id) WHERE deleted_at IS NULL;');

    this.addSql('create table if not exists "product_review_response" ("id" text not null, "content" text not null, "product_review_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_review_response_pkey" primary key ("id"));');
    this.addSql('alter table if exists "product_review_response" add constraint "product_review_response_product_review_id_unique" unique ("product_review_id");');
    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_product_review_response_product_review_id" ON "product_review_response" (product_review_id) WHERE deleted_at IS NULL;');

    this.addSql('create table if not exists "product_review_stats" ("id" text not null, "product_id" text not null, "average_rating" integer null, "review_count" integer not null default 0, "rating_count_1" integer not null default 0, "rating_count_2" integer not null default 0, "rating_count_3" integer not null default 0, "rating_count_4" integer not null default 0, "rating_count_5" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_review_stats_pkey" primary key ("id"));');

    this.addSql('alter table if exists "product_review_image" add constraint "product_review_image_product_review_id_foreign" foreign key ("product_review_id") references "product_review" ("id") on update cascade;');

    this.addSql('alter table if exists "product_review_response" add constraint "product_review_response_product_review_id_foreign" foreign key ("product_review_id") references "product_review" ("id") on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table if exists "product_review_image" drop constraint if exists "product_review_image_product_review_id_foreign";');

    this.addSql('alter table if exists "product_review_response" drop constraint if exists "product_review_response_product_review_id_foreign";');

    this.addSql('drop table if exists "product_review" cascade;');

    this.addSql('drop table if exists "product_review_image" cascade;');

    this.addSql('drop table if exists "product_review_response" cascade;');

    this.addSql('drop table if exists "product_review_stats" cascade;');
  }

}
