import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import About from "./pages/About";
import Features from "./pages/Features";
import Faqs from "./pages/Faqs";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Disclaimer from "./pages/Disclaimer";
import NotFound from "./pages/NotFound";
import ContractAnalyzer from "./pages/ContractAnalyzer";
import AILawyer from "./pages/AILawyer";
import ContractComparisonPage from "./pages/contractComparisonPage";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import MembershipPage from "./pages/JOIN";
import LegalCommunity from "./pages/LegalCommunity";
import AdminLawyerVerification from "./components/AdminLawyerVerification";
import AdminDashboard from "./components/AdminDashboard";
import AdminLayout from "./components/AdminLayout";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import DebugRedux from "./components/DebugRedux";
import { Provider } from "react-redux";
import { store } from "./store/store";
import SignOut from "./pages/SignOut";

const queryClient = new QueryClient();

const App = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <DebugRedux />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/features" element={<Features />} />
              <Route path="/faqs" element={<Faqs />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              <Route
                path="/contract-analyzer"
                element={
                  <PrivateRoute>
                    <ContractAnalyzer />
                  </PrivateRoute>
                }
              />
              <Route
                path="/ai-lawyer"
                element={
                  <PrivateRoute>
                    <AILawyer />
                  </PrivateRoute>
                }
              />
              <Route
                path="/contract-comparison"
                element={
                  <PrivateRoute>
                    <ContractComparisonPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/legal-community"
                element={
                  <PrivateRoute>
                    <LegalCommunity />
                  </PrivateRoute>
                }
              />
                      <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminDashboard />} />
          <Route path="lawyers" element={<AdminDashboard />} />
          <Route path="applications" element={<AdminDashboard />} />
          <Route path="analytics" element={<AdminDashboard />} />
          <Route path="settings" element={<AdminDashboard />} />
        </Route>
              <Route path="/signUp" element={<SignUp />} />
              <Route path="/signIn" element={<SignIn />} />
              <Route path="/signOut" element={<SignOut />} />
              <Route path="/join" element={<MembershipPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
