import { FC } from 'react';
import { PostSection } from '@marketplace/util/medusa/types';
import { generateSectionStyles } from '../helpers/styles';

export interface PostSectionStylesProps {
  section: PostSection;
}

export const PostSectionStyles: FC<PostSectionStylesProps> = ({ section }) => {
  const { styles } = generateSectionStyles(section);
  // Note: styles must be applied with dangerouslySetInnerHTML to avoid hydration mismatch errors some odd reason
  return <style type="text/css" dangerouslySetInnerHTML={{ __html: styles }} />;
};
