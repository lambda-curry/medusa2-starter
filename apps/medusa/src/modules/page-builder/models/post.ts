import { model } from '@medusajs/framework/utils';
import { PostSectionModel } from './post-section';
import { PostTagModel } from './post-tag';
import { PostAuthorModel } from './post-author';
import { ImageModel } from './image';
import { postContentModeValues, postStatusValues, postTypeValues } from '../enum-values';

export const PostModel = model.define(
  { name: 'post', tableName: 'page_builder_post' },
  {
    id: model.id({ prefix: 'post' }).primaryKey(),
    type: model.enum([...postTypeValues]),
    title: model.text().searchable(),
    handle: model.text().unique().searchable().nullable(),
    excerpt: model.text().searchable().nullable(),
    content: model.json().nullable(),
    status: model.enum([...postStatusValues]).default('draft'),
    content_mode: model.enum([...postContentModeValues]).default('advanced'),
    meta_title: model.text().nullable(),
    meta_description: model.text().nullable(),
    meta_image_url: model.text().nullable(),

    published_at: model.text().nullable(),
    archived_at: model.text().nullable(),
    is_home_page: model.boolean().default(false),

    // relations fields
    featured_image: model.hasOne(() => ImageModel, {
      mappedBy: 'post',
    }),

    authors: model.manyToMany(() => PostAuthorModel, {
      mappedBy: 'posts',
    }),

    root: model.belongsTo(() => PostModel).nullable(),

    sections: model.hasMany(() => PostSectionModel),

    tags: model.manyToMany(() => PostTagModel, {
      mappedBy: 'posts',
    }),
  },
);
