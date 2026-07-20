import { ShopCartProvider } from "@marketing/context/ShopCartContext";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <ShopCartProvider>{children}</ShopCartProvider>;
}
