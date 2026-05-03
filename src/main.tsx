import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { pingServer } from "@/services/backendService";

pingServer(); // ✅ wakes up Render server before React even renders

createRoot(document.getElementById("root")!).render(<App />);