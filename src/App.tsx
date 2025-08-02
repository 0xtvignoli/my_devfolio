import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import HelmDeployArticle from "./pages/HelmDeployArticle";
import K8sProductionArticle from "./pages/K8sProductionArticle";
import IaCBestPracticesArticle from "./pages/IaCBestPracticesArticle";

// Lazy load article components
const HelmDeployArticle = lazy(() => import("./pages/HelmDeployArticle"));
const K8sProductionArticle = lazy(() => import("./pages/K8sProductionArticle"));
const IaCBestPracticesArticle = lazy(() => import("./pages/IaCBestPracticesArticle"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route 
            path="/article/helm-deploy" 
            element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                <HelmDeployArticle />
              </Suspense>
            } 
          />
          <Route 
            path="/article/k8s-production" 
            element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                <K8sProductionArticle />
              </Suspense>
            } 
          />
          <Route 
            path="/article/iac-best-practices" 
            element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                <IaCBestPracticesArticle />
              </Suspense>
            } 
          />
          <Route path="/article/helm-deploy" element={<HelmDeployArticle />} />
          <Route path="/article/k8s-production" element={<K8sProductionArticle />} />
          <Route path="/article/iac-best-practices" element={<IaCBestPracticesArticle />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Analytics />
      <SpeedInsights />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
