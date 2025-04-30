import { AdminCallbackPage } from "./pages/admin";
import { Route, Routes } from "react-router-dom";
import LoadingPage from "./pages/loading";
import LoginPage from "./pages/login";
import NotFoundPage from "./pages/not-found";
import { LinkCustomersPage } from "./pages/customers";
import HomePage from "./pages/home/HomePage";

export default function App() {
  return (
    <Routes>
      <Route index element={<LoadingPage />} />
      <Route path="/admin/callback" element={<AdminCallbackPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/customers/link" element={<LinkCustomersPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};