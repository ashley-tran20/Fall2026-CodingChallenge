import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Homepage from "./routes/homePage/homePage";
import CreatePage from "./routes/createPage/createPage";
import Post from "./routes/post/postPage";
import AuthPage from "./routes/authPage/authPage";
import ProfilePage from "./routes/profilePage/profilePage";
import SearchPage from "./routes/searchPage/searchPage";
import { BrowserRouter, Routes, Route } from "react-router";
import MainLayout from "./routes/layout/mainLayout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import BoardPage from "./routes/boardPage/boardPage";
import Notifications from "./components/notifications/notifications";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Homepage />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/pin/:id" element={<Post />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/:username" element={<ProfilePage />} />
            <Route path="/board/:id" element={<BoardPage />} />
          </Route>
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);