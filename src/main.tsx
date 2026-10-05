import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { ErrorBoundary } from "./ErrorBoundary";

const container = document.getElementById("root")!;

// index.html ships a visible "still loading" placeholder inside #root so a
// failed boot is never a silent white page. Clear it now that the bundle has
// executed — createRoot() would leave it in place until the first paint,
// and a throw during that paint would leave both on screen at once.
container.innerHTML = "";

createRoot(container).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
