import type { PostSection } from '../../models';
import type {
  AdminPageBuilderListPostSectionsQuery,
  AdminPageBuilderListPostSectionsResponse,
  AdminPageBuilderCreatePostSectionBody,
  AdminPageBuilderCreatePostSectionResponse,
  AdminPageBuilderUpdatePostSectionBody,
  AdminPageBuilderUpdatePostSectionResponse,
  AdminPageBuilderDeletePostSectionResponse,
  AdminPageBuilderDuplicatePostSectionResponse,
} from '../../admins';

export interface AdminPageBuilderEndpoints {
  listPostSections: {
    GET: {
      query: AdminPageBuilderListPostSectionsQuery;
      response: AdminPageBuilderListPostSectionsResponse;
    };
  };
  createPostSection: {
    POST: {
      body: AdminPageBuilderCreatePostSectionBody;
      response: AdminPageBuilderCreatePostSectionResponse;
    };
  };
  updatePostSection: {
    POST: {
      params: {
        id: string;
      };
      body: AdminPageBuilderUpdatePostSectionBody;
      response: AdminPageBuilderUpdatePostSectionResponse;
    };
  };
  deletePostSection: {
    DELETE: {
      params: {
        id: string;
      };
      response: AdminPageBuilderDeletePostSectionResponse;
    };
  };
  duplicatePostSection: {
    POST: {
      params: {
        id: string;
      };
      response: AdminPageBuilderDuplicatePostSectionResponse;
    };
  };
}
