// import { LoaderFunctionArgs, useNavigate, useParams } from 'react-router-dom';
// import { PostDetailsForm } from '../../../../components/organisms/editor/PostDetailsForm';

// export async function loader({ params }: LoaderFunctionArgs) {
//   console.log('🚀 ~ loader ~ content/editor/:id ~ params:', params);

//   return {
//     post: {
//       id: params.id,
//       handle: 'about',
//       title: 'Test Page',
//       description: 'Test Page Description',
//       image: '',
//       type: 'page',
//     },
//   };
// }

// export const handle = {
//   breadcrumb: () => 'Your Awesome Page',
// };

// const PostDetailsPage = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const initialData = {
//     handle: 'about',
//     title: 'Test Page',
//     description: 'Test Page Description',
//     image: null,
//   };

//   const handleAfterSave = async () => {
//     console.log('Post saved successfully');
//   };

//   const handleAfterDelete = async () => {
//     navigate('/content/posts');
//   };

//   return (
//     <>
//       <style>
//         {`
//         div:has(> aside.flex.flex-1.flex-col.justify-between.overflow-y-auto) {
//           display: none !important;
//         }
//       `}
//       </style>
//       <PostDetailsForm
//         id={id as string}
//         initialData={initialData}
//         afterSave={handleAfterSave}
//         afterDelete={handleAfterDelete}
//       />
//     </>
//   );
// };

// export default PostDetailsPage;
