import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./redux/store";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <App />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3500,
              className: "",
              style: {
                background: "#111827",
                color: "#e5e7eb",
                borderRadius: "14px",
                padding: "10px 14px",
                border: "1px solid #374151",
                boxShadow: "0 10px 25px rgba(0,0,0,0.35)",
              },
              success: {
                iconTheme: {
                  primary: "#10B981",
                  secondary: "#111827",
                },
                style: { border: "1px solid #065f46" },
              },
              error: {
                iconTheme: {
                  primary: "#EF4444",
                  secondary: "#111827",
                },
                style: { border: "1px solid #7f1d1d" },
              },
            }}
          />
        </PersistGate>
      </Provider>
    </BrowserRouter>
  </StrictMode>
);
