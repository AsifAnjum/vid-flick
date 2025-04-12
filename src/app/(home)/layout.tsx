import { HomeLayout } from "@/modules/home/ui/layouts/home-layout";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  console.log("Layout render", children);
  return <HomeLayout>{children}</HomeLayout>;
};

export default Layout;
