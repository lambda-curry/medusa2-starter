import { UploadHandler, unstable_composeUploadHandlers, unstable_createMemoryUploadHandler } from '@remix-run/node';
import { unstable_createFileUploadHandler } from '@remix-run/node';

export const standardFileUploadHandler = unstable_composeUploadHandlers(
  unstable_createFileUploadHandler({
    avoidFileConflicts: true,
    directory: '/tmp',
    file: ({ filename }) => filename,
    maxPartSize: 15_000_000,
  }),
  unstable_createMemoryUploadHandler(),
);

export const uploadHandler: UploadHandler = async (part) => {
  return standardFileUploadHandler(part);
};
