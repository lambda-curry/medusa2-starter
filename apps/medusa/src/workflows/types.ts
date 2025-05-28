import type { Post } from '@lambdacurry/page-builder-types';

export type CreatePostSectionStepInput = {
  name: string;
  layout?: 'full_width' | 'two_column' | 'grid';
  sort_order?: number;
  blocks?: any;
  post_id?: string;
  post_template_id?: string;
  status?: 'draft' | 'published' | 'archived';
};

export type UpdatePostSectionStepInput = Partial<CreatePostSectionStepInput> & {
  id: string;
};

export type CreatePostSectionWorkflowInput = {
  section: CreatePostSectionStepInput;
};

export type UpdatePostSectionWorkflowInput = {
  section: UpdatePostSectionStepInput;
};

export type DeletePostSectionWorkflowInput = {
  id: string;
};

type PostInput = Omit<
  Post,
  'id' | 'created_at' | 'updated_at' | 'featured_image' | 'root' | 'sections' | 'authors' | 'tags'
>;

// Post types
export type CreatePostStepInput = Partial<PostInput> & {
  featured_image_id?: string;
  authors?: string[];
  tags?: string[];
};

export type UpdatePostStepInput = {
  id: string;
  sections?: string[];
} & Partial<CreatePostStepInput>;

export type DeletePostStepInput = {
  id: string;
};

export type CreatePostWorkflowInput = {
  post: CreatePostStepInput;
};

export type UpdatePostWorkflowInput = {
  post: UpdatePostStepInput;
};

export type DeletePostWorkflowInput = {
  id: string;
};

export type DuplicatePostStepInput = {
  id: string;
};

export type DuplicatePostWorkflowInput = {
  id: string;
};
