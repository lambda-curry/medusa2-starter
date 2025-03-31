import { LoaderFunctionArgs, useLoaderData, useParams } from "react-router-dom"
import { EditorTopbar } from "../components/editor-top-bar"
import { EditorModal } from "../components/editor-modal"
import { EditorSidebarProvider } from "../providers/editor-sidebar-provider"
import { PostEditorLayout } from "../components/post-editor-layout"
import { TooltipProvider } from "@medusajs/ui"


export async function loader({ params }: LoaderFunctionArgs) {
  console.log("🚀 ~ loader ~ content/editor/:id ~ params:", params)

  return {
    post: {
      id: params.id,
      title: "Test Page",
      description: "Test Page Description",
      content: "Test Page Content",
      type: "page",
    },
  }
}

const PostDetailsPage = () => {
  const { id } = useParams()
  console.log("🚀 ~ PostDetailsPage ~ id:", id)
  // const postData = useLoaderData() as Awaited<ReturnType<typeof loader>>
  // console.log("🚀 ~ PostDetailsPage ~ post:", postData)
  const pageName = "Test Page"

  return (
      <TooltipProvider>
    <EditorSidebarProvider>
      <EditorModal open={true}>
        <EditorModal.Content>
          <EditorModal.Header>
            {/* EditorModal.Title is required by EditorModal.Content */}
            <EditorModal.Title hidden={true}>{pageName}</EditorModal.Title>
            <EditorTopbar />
          </EditorModal.Header>
          <EditorModal.Body className="flex flex-col items-center">
            <PostEditorLayout>
              {/* <h1>{postData.post?.title}</h1>
              <p>{postData.post?.description}</p> */}
              <h1>{pageName}</h1>
            </PostEditorLayout>
          </EditorModal.Body>
        </EditorModal.Content>
      </EditorModal>
    </EditorSidebarProvider>
      </TooltipProvider>
  )
}

export default PostDetailsPage 
