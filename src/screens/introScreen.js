import { BADGE_ICON_SVG } from "../icons.js";

const STEP_ICONS = {
  check: `<svg viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  play: `<svg viewBox="0 0 24 24" fill="none"><path d="M8 6.5v11l9-5.5-9-5.5z" fill="#fff"/></svg>`,
  cash: `<svg viewBox="0 0 24 24" fill="none"><text x="12" y="17" text-anchor="middle" font-size="15" font-weight="700" fill="#fff" font-family="inherit">$</text></svg>`,
};

/**
 * Screen 1 — the intro / hook screen. The "Play Game" CTA is purely
 * navigational (moves to the game screen); it does not use the affiliate URL.
 */
export function renderIntroScreen(container, { onPlay }) {
  container.innerHTML = `
    <section class="screen intro-screen">
      <div class="intro-icon">${BADGE_ICON_SVG}</div>

      <h1 class="intro-headline">Get <span class="accent">Paid</span> From<br>Your Phone</h1>

      <p class="intro-subtext">
        Play games, test apps &amp; take surveys — cash out to PayPal, Venmo or your bank.
      </p>

      <div class="steps-row">
        <div class="step">
          <div class="step-circle">${STEP_ICONS.check}</div>
          <span class="step-label">SIGN UP</span>
        </div>
        <div class="step-connector"></div>
        <div class="step">
          <div class="step-circle">${STEP_ICONS.play}</div>
          <span class="step-label">PLAY</span>
        </div>
        <div class="step-connector"></div>
        <div class="step">
          <div class="step-circle">${STEP_ICONS.cash}</div>
          <span class="step-label">CASH OUT</span>
        </div>
      </div>

      <button type="button" class="cta-button" id="play-game-btn">Play Game</button>
      <p class="cta-note">No credit card required</p>
    </section>
  `;

  container.querySelector("#play-game-btn").addEventListener("click", onPlay);
}
