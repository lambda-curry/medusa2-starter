import { Toaster } from "@medusajs/ui"

export type SingleColumnLayoutProps = {
  children: React.ReactNode
}

export const SingleColumnLayout = ({ children }: SingleColumnLayoutProps) => {
  return (
    <>
      <Toaster />
      <div className="flex flex-col gap-y-3">
        {children}
      </div>
    </>
  )
}