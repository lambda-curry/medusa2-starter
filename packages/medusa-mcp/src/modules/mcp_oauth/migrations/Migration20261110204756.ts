import { Migration } from '@medusajs/framework/mikro-orm/migrations';

export class Migration20261110204756 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table if exists "mcp_oauth_token" drop constraint if exists "mcp_oauth_token_refresh_token_hash_unique";`,
    );
    this.addSql(
      `alter table if exists "mcp_oauth_token" drop constraint if exists "mcp_oauth_token_access_token_hash_unique";`,
    );
    this.addSql(
      `alter table if exists "mcp_oauth_token" drop constraint if exists "mcp_oauth_token_parent_token_id_unique";`,
    );
    this.addSql(
      `alter table if exists "mcp_oauth_token" drop constraint if exists "mcp_oauth_token_authorization_id_unique";`,
    );
    this.addSql(
      `alter table if exists "mcp_oauth_client" drop constraint if exists "mcp_oauth_client_client_id_unique";`,
    );
    this.addSql(
      `alter table if exists "mcp_oauth_authorization" drop constraint if exists "mcp_oauth_authorization_code_hash_unique";`,
    );
    this.addSql(
      `create table if not exists "mcp_oauth_authorization" ("id" text not null, "code_hash" text not null, "client_id" text not null, "user_id" text not null, "auth_identity_id" text not null, "scopes" text[] not null, "resource" text not null, "redirect_uri" text not null, "code_challenge" text not null, "expires_at" timestamptz not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "mcp_oauth_authorization_pkey" primary key ("id"));`,
    );
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_mcp_oauth_authorization_code_hash_unique" ON "mcp_oauth_authorization" ("code_hash") WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_mcp_oauth_authorization_deleted_at" ON "mcp_oauth_authorization" ("deleted_at") WHERE deleted_at IS NULL;`,
    );

    this.addSql(
      `create table if not exists "mcp_oauth_client" ("id" text not null, "client_id" text not null, "registration" text check ("registration" in ('cimd', 'dcr')) not null, "client_name" text not null, "redirect_uris" text[] not null, "metadata" jsonb not null, "metadata_fetched_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "mcp_oauth_client_pkey" primary key ("id"));`,
    );
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_mcp_oauth_client_client_id_unique" ON "mcp_oauth_client" ("client_id") WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_mcp_oauth_client_deleted_at" ON "mcp_oauth_client" ("deleted_at") WHERE deleted_at IS NULL;`,
    );

    this.addSql(
      `create table if not exists "mcp_oauth_token" ("id" text not null, "family_id" text not null, "authorization_id" text null, "parent_token_id" text null, "client_id" text not null, "user_id" text not null, "auth_identity_id" text not null, "scopes" text[] not null, "resource" text not null, "access_token_hash" text not null, "access_expires_at" timestamptz not null, "refresh_token_hash" text not null, "refresh_expires_at" timestamptz not null, "rotated_at" timestamptz null, "revoked_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "mcp_oauth_token_pkey" primary key ("id"));`,
    );
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_mcp_oauth_token_authorization_id_unique" ON "mcp_oauth_token" ("authorization_id") WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_mcp_oauth_token_parent_token_id_unique" ON "mcp_oauth_token" ("parent_token_id") WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_mcp_oauth_token_access_token_hash_unique" ON "mcp_oauth_token" ("access_token_hash") WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_mcp_oauth_token_refresh_token_hash_unique" ON "mcp_oauth_token" ("refresh_token_hash") WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_mcp_oauth_token_deleted_at" ON "mcp_oauth_token" ("deleted_at") WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_mcp_oauth_token_family_id" ON "mcp_oauth_token" ("family_id") WHERE deleted_at IS NULL;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "mcp_oauth_authorization" cascade;`);

    this.addSql(`drop table if exists "mcp_oauth_client" cascade;`);

    this.addSql(`drop table if exists "mcp_oauth_token" cascade;`);
  }
}
