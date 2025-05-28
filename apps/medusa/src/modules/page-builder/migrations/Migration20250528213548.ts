import { Migration } from '@mikro-orm/migrations';

export class Migration20250528213548 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "page_builder_post" drop column if exists "seo";`);

    this.addSql(`alter table if exists "page_builder_post" add column if not exists "meta_title" text null, add column if not exists "meta_description" text null, add column if not exists "meta_image_url" text null;`);

    this.addSql(`alter table if exists "page_builder_post_section" drop column if exists "type", drop column if exists "content", drop column if exists "settings", drop column if exists "styles", drop column if exists "is_reusable", drop column if exists "usage_count";`);

    this.addSql(`alter table if exists "page_builder_post_section" add column if not exists "layout" text check ("layout" in ('full_width', 'two_column', 'grid')) not null default 'full_width', add column if not exists "blocks" jsonb not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "page_builder_post" drop column if exists "meta_title", drop column if exists "meta_description", drop column if exists "meta_image_url";`);

    this.addSql(`alter table if exists "page_builder_post" add column if not exists "seo" jsonb null;`);

    this.addSql(`alter table if exists "page_builder_post_section" drop column if exists "layout";`);

    this.addSql(`alter table if exists "page_builder_post_section" add column if not exists "type" text check ("type" in ('button_list', 'cta', 'header', 'hero', 'product_carousel', 'product_grid', 'image_gallery', 'raw_html', 'rich_text', 'blog_list')) not null, add column if not exists "settings" jsonb not null, add column if not exists "styles" jsonb null, add column if not exists "is_reusable" boolean not null default false, add column if not exists "usage_count" integer not null default 1;`);
    this.addSql(`alter table if exists "page_builder_post_section" rename column "blocks" to "content";`);
  }

}
