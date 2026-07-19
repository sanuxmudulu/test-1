import "./style.css";
import { renderIntroScreen } from "./screens/introScreen.js";
import { renderGameScreen } from "./screens/gameScreen.js";
import { renderFinalScreen } from "./screens/finalScreen.js";
import { buildCtaUrl } from "./cta.js";

const appRoot = document.getElementById("app");
const shell = document.createElement("div");
shell.className = "app-shell";
appRoot.appendChild(shell);

// Built once from the incoming `source` query param (see cta.js) and reused
// for every affiliate CTA in the flow.
const ctaUrl = buildCtaUrl();

showIntroScreen();

function showIntroScreen() {
  renderIntroScreen(shell, { onPlay: showGameScreen });
}

function showGameScreen() {
  renderGameScreen(shell, { onComplete: ({ baseEarned }) => showFinalScreen(baseEarned) });
}

function showFinalScreen(baseEarned) {
  renderFinalScreen(shell, { baseEarned, ctaUrl });
}
