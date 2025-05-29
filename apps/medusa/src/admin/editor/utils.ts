export const editSectionPath = ({ postId, sectionId }: { postId: string; sectionId: string }) => {
  return `/content/posts/${postId}/sections/${sectionId}`;
};
