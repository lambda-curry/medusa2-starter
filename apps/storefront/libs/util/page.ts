import { getCommonMeta, getParentMeta, mergeMeta } from './meta';

export const getMergedPageMeta = mergeMeta(getParentMeta, getCommonMeta);
