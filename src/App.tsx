import { AdminCallbackPage } from "./pages/admin";
import { Route, Routes } from "react-router-dom";
import LoadingPage from "./pages/loading";
import NotFoundPage from "./pages/not-found";
import LoginPage from "./pages/login";

function App() {
  return (
    <Routes>
      <Route index element={<LoadingPage />} />
      <Route path="/admin/callback" element={<AdminCallbackPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<NotFoundPage />} />

    </Routes>
  );
}

export default App;
