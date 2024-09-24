import { FC, PropsWithChildren } from 'react';
import { PostSection } from '@marketplace/util/medusa/types';

export type PostSectionComponent<T extends PostSection, S = any> = FC<
  PropsWithChildren<{ section: T; isPreview?: boolean; data?: S }>
>;
