import { Route, Routes } from "react-router-dom";
import LoadingPage from "./pages/loading";
import NotFoundPage from "./pages/not-found";

function App() {
  return (
      <Routes>
        <Route index element={<LoadingPage />} />
      <Route path="*" element={<NotFoundPage />} />

      </Routes>
  );
}

export default App;
