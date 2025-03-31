import { Migration } from '@mikro-orm/migrations';

export class Migration20250305164601 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "image" drop constraint if exists "image_site_settings_id_unique";`);
    this.addSql(`alter table if exists "image" drop constraint if exists "image_post_id_unique";`);
    this.addSql(`alter table if exists "post_tag" drop constraint if exists "post_tag_handle_unique";`);
    this.addSql(`alter table if exists "post_author" drop constraint if exists "post_author_medusa_user_id_unique";`);
    this.addSql(`alter table if exists "post" drop constraint if exists "post_handle_unique";`);
    this.addSql(`create table if not exists "navigation_item" ("id" text not null, "label" text not null, "location" text check ("location" in ('header', 'footer')) not null, "url" text not null, "new_tab" boolean not null default false, "sort_order" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "navigation_item_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_navigation_item_deleted_at" ON "navigation_item" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "post" ("id" text not null, "type" text check ("type" in ('page', 'post')) not null, "title" text not null, "handle" text not null, "excerpt" text null, "content" jsonb null, "status" text check ("status" in ('draft', 'published', 'archived')) not null default 'draft', "content_mode" text check ("content_mode" in ('basic', 'advanced')) not null, "seo" jsonb null, "published_at" text null, "archived_at" text null, "is_home_page" boolean not null default false, "root_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "post_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_post_handle_unique" ON "post" (handle) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_post_root_id" ON "post" (root_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_post_deleted_at" ON "post" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "post_author" ("id" text not null, "name" text not null, "medusa_user_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "post_author_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_post_author_medusa_user_id_unique" ON "post_author" (medusa_user_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_post_author_deleted_at" ON "post_author" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "post_post_authors" ("post_id" text not null, "post_author_id" text not null, constraint "post_post_authors_pkey" primary key ("post_id", "post_author_id"));`);

    this.addSql(`create table if not exists "post_tag" ("id" text not null, "label" text not null, "handle" text not null, "description" text not null, "created_by_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "post_tag_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_post_tag_handle_unique" ON "post_tag" (handle) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_post_tag_deleted_at" ON "post_tag" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "post_post_tags" ("post_id" text not null, "post_tag_id" text not null, constraint "post_post_tags_pkey" primary key ("post_id", "post_tag_id"));`);

    this.addSql(`create table if not exists "post_template" ("id" text not null, "title" text not null, "status" text check ("status" in ('draft', 'published', 'archived')) not null default 'draft', "type" text check ("type" in ('page', 'post')) not null, "description" text null, "sort_order" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "post_template_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_post_template_deleted_at" ON "post_template" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "post_section" ("id" text not null, "type" text check ("type" in ('button_list', 'cta', 'header', 'hero', 'product_carousel', 'product_grid', 'image_gallery', 'raw_html', 'rich_text', 'blog_list')) not null, "status" text check ("status" in ('draft', 'published', 'archived')) not null default 'draft', "name" text not null, "content" jsonb not null, "settings" jsonb not null, "styles" jsonb null, "is_reusable" boolean not null default false, "usage_count" integer not null default 1, "sort_order" integer not null, "post_id" text null, "post_template_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "post_section_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_post_section_post_id" ON "post_section" (post_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_post_section_post_template_id" ON "post_section" (post_template_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_post_section_deleted_at" ON "post_section" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "site_settings" ("id" text not null, "description" text null, "header_code" text null, "footer_code" text null, "storefront_url" text null, "primary_theme_colors" jsonb null, "accent_theme_colors" jsonb null, "highlight_theme_colors" jsonb null, "display_font" jsonb null, "body_font" jsonb null, "include_site_name_beside_logo" boolean not null, "social_instagram" text null, "social_youtube" text null, "social_facebook" text null, "social_twitter" text null, "social_linkedin" text null, "social_pinterest" text null, "social_tiktok" text null, "social_snapchat" text null, "global_css" text null, "ga_property_id" text null, "shipping_sort" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "site_settings_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_site_settings_deleted_at" ON "site_settings" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "image" ("id" text not null, "url" text not null, "metadata" jsonb null, "post_id" text null, "site_settings_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "image_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_image_post_id_unique" ON "image" (post_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_image_site_settings_id_unique" ON "image" (site_settings_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_image_deleted_at" ON "image" (deleted_at) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_image_url" ON "image" (url) WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "post" add constraint "post_root_id_foreign" foreign key ("root_id") references "post" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table if exists "post_post_authors" add constraint "post_post_authors_post_id_foreign" foreign key ("post_id") references "post" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table if exists "post_post_authors" add constraint "post_post_authors_post_author_id_foreign" foreign key ("post_author_id") references "post_author" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table if exists "post_post_tags" add constraint "post_post_tags_post_id_foreign" foreign key ("post_id") references "post" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table if exists "post_post_tags" add constraint "post_post_tags_post_tag_id_foreign" foreign key ("post_tag_id") references "post_tag" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table if exists "post_section" add constraint "post_section_post_id_foreign" foreign key ("post_id") references "post" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table if exists "post_section" add constraint "post_section_post_template_id_foreign" foreign key ("post_template_id") references "post_template" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table if exists "image" add constraint "image_post_id_foreign" foreign key ("post_id") references "post" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table if exists "image" add constraint "image_site_settings_id_foreign" foreign key ("site_settings_id") references "site_settings" ("id") on update cascade on delete set null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "post" drop constraint if exists "post_root_id_foreign";`);

    this.addSql(`alter table if exists "post_post_authors" drop constraint if exists "post_post_authors_post_id_foreign";`);

    this.addSql(`alter table if exists "post_post_tags" drop constraint if exists "post_post_tags_post_id_foreign";`);

    this.addSql(`alter table if exists "post_section" drop constraint if exists "post_section_post_id_foreign";`);

    this.addSql(`alter table if exists "image" drop constraint if exists "image_post_id_foreign";`);

    this.addSql(`alter table if exists "post_post_authors" drop constraint if exists "post_post_authors_post_author_id_foreign";`);

    this.addSql(`alter table if exists "post_post_tags" drop constraint if exists "post_post_tags_post_tag_id_foreign";`);

    this.addSql(`alter table if exists "post_section" drop constraint if exists "post_section_post_template_id_foreign";`);

    this.addSql(`alter table if exists "image" drop constraint if exists "image_site_settings_id_foreign";`);

    this.addSql(`drop table if exists "navigation_item" cascade;`);

    this.addSql(`drop table if exists "post" cascade;`);

    this.addSql(`drop table if exists "post_author" cascade;`);

    this.addSql(`drop table if exists "post_post_authors" cascade;`);

    this.addSql(`drop table if exists "post_tag" cascade;`);

    this.addSql(`drop table if exists "post_post_tags" cascade;`);

    this.addSql(`drop table if exists "post_template" cascade;`);

    this.addSql(`drop table if exists "post_section" cascade;`);

    this.addSql(`drop table if exists "site_settings" cascade;`);

    this.addSql(`drop table if exists "image" cascade;`);
  }

}
