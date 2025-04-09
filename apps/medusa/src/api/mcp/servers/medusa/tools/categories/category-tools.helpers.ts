import type { CategoryBase } from './category-tools.schemas';

const generateUniqueHandle = (name: string) => {
  const timestamp = Date.now();
  const baseHandle = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `${baseHandle}-${timestamp}`;
};

export const transformCategory = (category: CategoryBase) => ({
  name: category.name,
  handle: category.handle || generateUniqueHandle(category.name),
  is_internal: category.is_internal ?? false,
  is_active: category.is_active ?? true,
  parent_category_id: category.parent_category_id ?? null,
  metadata: category.metadata || {},
});

export const transformCategories = (categories: CategoryBase[]) => categories.map(transformCategory);
