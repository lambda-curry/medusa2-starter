import { FC } from "react"
import { NavLink } from "@remix-run/react"
import clsx from "clsx"
import {
  ContentBlockTypes,
  type ParagraphContentBlock,
  type Page,
} from "@libs/util/medusa/types"
import { formatDate } from "@libs/util/formatters"
import { Card } from "@ui-components/common/card/Card"
import { CardThumbnail } from "@ui-components/common/card/CardThumbnail"
import { CardContent } from "@ui-components/common/card/CardContent"
import { CardHeader } from "@ui-components/common/card/CardHeader"
import { CardTitle } from "@ui-components/common/card/CardTitle"
import { CardLabel } from "@ui-components/common/card/CardLabel"
import { CardBody } from "@ui-components/common/card/CardBody"
import { CardExcerpt } from "@ui-components/common/card/CardExcerpt"
import { CardDate } from "@ui-components/common/card/CardDate"
import { CardFooter } from "@ui-components/common/card"

export interface PostCardProps {
  className?: string
  post: Page
}

export const PostCard: FC<PostCardProps> = ({ className, post }) => {
  const excerpt =
    post.excerpt ||
    (
      post.content?.blocks?.find(
        (block) => block.type === ContentBlockTypes.paragraph,
      ) as ParagraphContentBlock
    )?.data?.text

  return (
    <NavLink
      prefetch="intent"
      className="flex-1"
      to={`/blog/${post.handle}`}
      unstable_viewTransition
    >
      {({ isTransitioning }) => (
        <Card
          className={clsx(
            "post-card h-full scale-[.99] text-left transition-all hover:scale-100 hover:shadow-lg active:scale-[.98] active:shadow-md",
            className,
          )}
        >
          {post.featured_image?.url && (
            <CardThumbnail
              style={{
                viewTransitionName: isTransitioning
                  ? "post-thumbnail"
                  : undefined,
              }}
              className="aspect-2 !m-0 w-full object-cover object-center"
              src={post.featured_image.url}
            />
          )}

          <CardContent className="py-4">
            <CardHeader className="mb-2 flex-wrap gap-2">
              <CardTitle className="!m-0 w-full pr-2">{post.title}</CardTitle>
              <div className="my-1 flex w-full gap-2">
                {post.tags.map((tag) => (
                  <CardLabel key={tag.id}>{tag.label}</CardLabel>
                ))}
              </div>

              {/* TODO: add tags back in when we can link to them */}
              {/* <div className="flex w-full gap-2 my-1">
              {post.tags.map(tag => (
                <Link className="!no-underline" key={tag.id} to={`/blog/tags/${tag.handle}`}>
                  <CardLabel>{tag.label}</CardLabel>
                </Link>
              ))}
            </div> */}
            </CardHeader>

            <CardBody>
              {excerpt && (
                <CardExcerpt dangerouslySetInnerHTML={{ __html: excerpt }} />
              )}
            </CardBody>
            <CardFooter className="!mt-4">
              <CardDate>
                {formatDate(new Date(post.published_at || post.created_at))}
              </CardDate>
            </CardFooter>
            {/* <CardFooter>{post.reading_time} minute read</CardFooter> */}
          </CardContent>
        </Card>
      )}
    </NavLink>
  )
}
