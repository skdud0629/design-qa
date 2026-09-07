import { createRoot } from "react-dom/client";
// eslint-disable-next-line no-unused-vars
import App from "./App.jsx";
import "./styles.css";

const rootEl = document.getElementById("root");
if (rootEl) {
	const root = createRoot(rootEl);
	root.render(<App />);
}
