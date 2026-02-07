import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { Outlet, useLocation } from "react-router-dom";
import { ScrollToTop } from "@/components/animations/ScrollToTop";
import { motion, AnimatePresence } from "framer-motion";

export function MainLayout() {
  const location = useLocation();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="h-screen flex w-full bg-background overflow-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <AppHeader />
          <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto scroll-smooth">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
            <ScrollToTop />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}