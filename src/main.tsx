import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "leaflet/dist/leaflet.css";
import "./index.css";

// Force clean render
createRoot(document.getElementById("root")!).render(<App />);
