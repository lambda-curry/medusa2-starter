import { clx } from "@medusajs/ui"
import { PropsWithChildren } from "react"

import { useLoadingState } from "../hooks/use-loading-state"

export const MainContent = ({ children }: PropsWithChildren) => {
  const { isLoading } = useLoadingState()

  return (
    <div className="flex h-screen w-full flex-col overflow-auto">
      <main
        className={clx(
          "flex h-full w-full flex-col items-center overflow-y-auto transition-opacity delay-200 duration-200",
          {
            "opacity-25": isLoading,
          }
        )}
      >
        {children}
      </main>
    </div>
  )
} 