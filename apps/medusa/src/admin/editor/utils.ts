export const editSectionPath = ({ postId, sectionId }: { postId: string; sectionId: string }) => {
  return `/content/editor/${postId}/section/${sectionId}`;
};
