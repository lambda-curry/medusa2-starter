import type { FC, ReactNode } from "react"
import clsx from "clsx"
import { Header } from "./header/Header"
import { LoginModal } from "../auth/LoginModal"
import { Footer } from "./footer/Footer"
import { CartDrawer } from "@ui-components/cart/CartDrawer"
import { SearchDrawer } from "@ui-components/search/SearchDrawer"

export interface PageProps {
  className?: string
  children: ReactNode
}

export const Page: FC<PageProps> = ({ className, children }) => {
  return (
    <div
      className={clsx(
        "page-layout flex min-h-screen flex-col bg-highlight-50",
        className,
      )}
    >
      <CartDrawer />
      <LoginModal />
      <SearchDrawer />
      <Header />
      <main className="flex-auto">
        <div className="w-full">{children}</div>
      </main>
      <Footer />
    </div>
  )
}
