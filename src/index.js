import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import GlobalStyles from "../src/components/GlobalStyles";

import App from "./App";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  // <StrictMode>
  <GlobalStyles>
    <App />
  </GlobalStyles>
  // </StrictMode>
);
