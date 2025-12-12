import "uno.css";
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, useRoutes } from "react-router-dom";

import routes from "~react-pages";
import Header from "./components/header";
import LoadingMask from "./components/LoadingMask";

function App() {
  return <Suspense fallback={<LoadingMask visible={true} />}>{useRoutes(routes)}</Suspense>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Header/>
      <App />
    </BrowserRouter>
  </StrictMode>
);
