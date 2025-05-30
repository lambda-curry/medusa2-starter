import { Migration } from '@mikro-orm/migrations';

export class Migration20250521141500 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "page_builder_image" drop constraint if exists "page_builder_image_site_settings_id_unique";`);
    this.addSql(`alter table if exists "page_builder_image" drop constraint if exists "page_builder_image_post_id_unique";`);
    this.addSql(`alter table if exists "page_builder_post_tag" drop constraint if exists "page_builder_post_tag_handle_unique";`);
    this.addSql(`alter table if exists "page_builder_post_author" drop constraint if exists "page_builder_post_author_medusa_user_id_unique";`);
    this.addSql(`alter table if exists "page_builder_post" drop constraint if exists "page_builder_post_handle_unique";`);
    this.addSql(`create table if not exists "page_builder_navigation_item" ("id" text not null, "label" text not null, "location" text check ("location" in ('header', 'footer')) not null, "url" text not null, "new_tab" boolean not null default false, "sort_order" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "page_builder_navigation_item_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_page_builder_navigation_item_deleted_at" ON "page_builder_navigation_item" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "page_builder_post" ("id" text not null, "type" text check ("type" in ('page', 'post')) not null, "title" text not null, "handle" text null, "excerpt" text null, "content" jsonb null, "status" text check ("status" in ('draft', 'published', 'archived')) not null default 'draft', "content_mode" text check ("content_mode" in ('basic', 'advanced')) not null default 'advanced', "seo" jsonb null, "published_at" text null, "archived_at" text null, "is_home_page" boolean not null default false, "root_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "page_builder_post_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_page_builder_post_handle_unique" ON "page_builder_post" (handle) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_page_builder_post_root_id" ON "page_builder_post" (root_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_page_builder_post_deleted_at" ON "page_builder_post" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "page_builder_post_author" ("id" text not null, "name" text not null, "medusa_user_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "page_builder_post_author_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_page_builder_post_author_medusa_user_id_unique" ON "page_builder_post_author" (medusa_user_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_page_builder_post_author_deleted_at" ON "page_builder_post_author" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "page_builder_post_page_builder_post_authors" ("post_id" text not null, "post_author_id" text not null, constraint "page_builder_post_page_builder_post_authors_pkey" primary key ("post_id", "post_author_id"));`);

    this.addSql(`create table if not exists "page_builder_post_tag" ("id" text not null, "label" text not null, "handle" text not null, "description" text not null, "created_by_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "page_builder_post_tag_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_page_builder_post_tag_handle_unique" ON "page_builder_post_tag" (handle) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_page_builder_post_tag_deleted_at" ON "page_builder_post_tag" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "page_builder_post_page_builder_post_tags" ("post_id" text not null, "post_tag_id" text not null, constraint "page_builder_post_page_builder_post_tags_pkey" primary key ("post_id", "post_tag_id"));`);

    this.addSql(`create table if not exists "page_builder_post_template" ("id" text not null, "title" text not null, "status" text check ("status" in ('draft', 'published', 'archived')) not null default 'draft', "type" text check ("type" in ('page', 'post')) not null, "description" text null, "sort_order" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "page_builder_post_template_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_page_builder_post_template_deleted_at" ON "page_builder_post_template" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "page_builder_post_section" ("id" text not null, "type" text check ("type" in ('button_list', 'cta', 'header', 'hero', 'product_carousel', 'product_grid', 'image_gallery', 'raw_html', 'rich_text', 'blog_list')) not null, "status" text check ("status" in ('draft', 'published', 'archived')) not null default 'draft', "name" text not null, "content" jsonb not null, "settings" jsonb not null, "styles" jsonb null, "is_reusable" boolean not null default false, "usage_count" integer not null default 1, "sort_order" integer not null, "post_id" text null, "post_template_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "page_builder_post_section_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_page_builder_post_section_post_id" ON "page_builder_post_section" (post_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_page_builder_post_section_post_template_id" ON "page_builder_post_section" (post_template_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_page_builder_post_section_deleted_at" ON "page_builder_post_section" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "page_builder_site_settings" ("id" text not null, "description" text null, "header_code" text null, "footer_code" text null, "storefront_url" text null, "primary_theme_colors" jsonb null, "accent_theme_colors" jsonb null, "highlight_theme_colors" jsonb null, "display_font" jsonb null, "body_font" jsonb null, "include_site_name_beside_logo" boolean not null, "social_instagram" text null, "social_youtube" text null, "social_facebook" text null, "social_twitter" text null, "social_linkedin" text null, "social_pinterest" text null, "social_tiktok" text null, "social_snapchat" text null, "global_css" text null, "ga_property_id" text null, "shipping_sort" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "page_builder_site_settings_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_page_builder_site_settings_deleted_at" ON "page_builder_site_settings" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "page_builder_image" ("id" text not null, "url" text not null, "metadata" jsonb null, "post_id" text null, "site_settings_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "page_builder_image_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_page_builder_image_post_id_unique" ON "page_builder_image" (post_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_page_builder_image_site_settings_id_unique" ON "page_builder_image" (site_settings_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_page_builder_image_deleted_at" ON "page_builder_image" (deleted_at) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_page_builder_image_url" ON "page_builder_image" (url) WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "page_builder_post" add constraint "page_builder_post_root_id_foreign" foreign key ("root_id") references "page_builder_post" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table if exists "page_builder_post_page_builder_post_authors" add constraint "page_builder_post_page_builder_post_authors_post_id_foreign" foreign key ("post_id") references "page_builder_post" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table if exists "page_builder_post_page_builder_post_authors" add constraint "page_builder_post_page_builder_post_authors_post_c619d_foreign" foreign key ("post_author_id") references "page_builder_post_author" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table if exists "page_builder_post_page_builder_post_tags" add constraint "page_builder_post_page_builder_post_tags_post_id_foreign" foreign key ("post_id") references "page_builder_post" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table if exists "page_builder_post_page_builder_post_tags" add constraint "page_builder_post_page_builder_post_tags_post_tag_id_foreign" foreign key ("post_tag_id") references "page_builder_post_tag" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table if exists "page_builder_post_section" add constraint "page_builder_post_section_post_id_foreign" foreign key ("post_id") references "page_builder_post" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table if exists "page_builder_post_section" add constraint "page_builder_post_section_post_template_id_foreign" foreign key ("post_template_id") references "page_builder_post_template" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table if exists "page_builder_image" add constraint "page_builder_image_post_id_foreign" foreign key ("post_id") references "page_builder_post" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table if exists "page_builder_image" add constraint "page_builder_image_site_settings_id_foreign" foreign key ("site_settings_id") references "page_builder_site_settings" ("id") on update cascade on delete set null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "page_builder_post" drop constraint if exists "page_builder_post_root_id_foreign";`);

    this.addSql(`alter table if exists "page_builder_post_page_builder_post_authors" drop constraint if exists "page_builder_post_page_builder_post_authors_post_id_foreign";`);

    this.addSql(`alter table if exists "page_builder_post_page_builder_post_tags" drop constraint if exists "page_builder_post_page_builder_post_tags_post_id_foreign";`);

    this.addSql(`alter table if exists "page_builder_post_section" drop constraint if exists "page_builder_post_section_post_id_foreign";`);

    this.addSql(`alter table if exists "page_builder_image" drop constraint if exists "page_builder_image_post_id_foreign";`);

    this.addSql(`alter table if exists "page_builder_post_page_builder_post_authors" drop constraint if exists "page_builder_post_page_builder_post_authors_post_c619d_foreign";`);

    this.addSql(`alter table if exists "page_builder_post_page_builder_post_tags" drop constraint if exists "page_builder_post_page_builder_post_tags_post_tag_id_foreign";`);

    this.addSql(`alter table if exists "page_builder_post_section" drop constraint if exists "page_builder_post_section_post_template_id_foreign";`);

    this.addSql(`alter table if exists "page_builder_image" drop constraint if exists "page_builder_image_site_settings_id_foreign";`);

    this.addSql(`drop table if exists "page_builder_navigation_item" cascade;`);

    this.addSql(`drop table if exists "page_builder_post" cascade;`);

    this.addSql(`drop table if exists "page_builder_post_author" cascade;`);

    this.addSql(`drop table if exists "page_builder_post_page_builder_post_authors" cascade;`);

    this.addSql(`drop table if exists "page_builder_post_tag" cascade;`);

    this.addSql(`drop table if exists "page_builder_post_page_builder_post_tags" cascade;`);

    this.addSql(`drop table if exists "page_builder_post_template" cascade;`);

    this.addSql(`drop table if exists "page_builder_post_section" cascade;`);

    this.addSql(`drop table if exists "page_builder_site_settings" cascade;`);

    this.addSql(`drop table if exists "page_builder_image" cascade;`);
  }

}
