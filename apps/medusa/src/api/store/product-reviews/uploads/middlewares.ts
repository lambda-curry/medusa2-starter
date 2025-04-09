// other imports...
import { MiddlewareRoute } from '@medusajs/framework/http';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

export const storeProductReviewUploadsMiddlewares: MiddlewareRoute[] = [
  {
    matcher: '/store/product-reviews/uploads',
    method: 'POST',
    middlewares: [upload.array('files')],
  },
];
