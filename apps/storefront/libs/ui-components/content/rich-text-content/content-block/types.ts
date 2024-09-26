import { ContentBlock } from '@libs/util/medusa/types';
import { FC, PropsWithChildren } from 'react';

export type ContentBlockComponentProps<T extends ContentBlock = ContentBlock> = FC<PropsWithChildren<{ block: T }>>;
