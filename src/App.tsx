import { AdminCallbackPage } from "./pages/admin";
import { Route, Routes, useNavigate } from "react-router-dom";
import LoadingPage from "./pages/loading";
import LoginPage from "./pages/login";
import NotFoundPage from "./pages/not-found";
import { LinkCustomersPage, ViewCustomersPage } from './pages/customers';
import HomePage from "./pages/home/HomePage";
import { useDeskproAppEvents } from '@deskpro/app-sdk';
import { EventPayload } from './types/general';
import { useLogOut } from './hooks/useLogOut';

export default function App() {
  const { logOut } = useLogOut();
  const navigate = useNavigate();

  useDeskproAppEvents({
    // @ts-ignore
    onElementEvent: (_, __, payload: EventPayload) => {
      switch (payload.type) {
        case 'logOut':
          logOut();

          break;

        case 'changePage':
          navigate(payload.path);

          break;
      };
    }
  }, [logOut]);

  return (
    <Routes>
      <Route index element={<LoadingPage />} />
      <Route path="/admin/callback" element={<AdminCallbackPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/customers/link" element={<LinkCustomersPage />} />
      <Route path="/customers/view" element={<ViewCustomersPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};