import { formatBoostDate } from "../utils/date.js";
import { BADGE_ICON_SVG } from "../icons.js";

const COUNTDOWN_START_SECONDS = 10 * 60;
const BOOST_MULTIPLIER = 2;

function formatMoney(amount) {
  return `$${amount.toFixed(2)}`;
}

function formatClock(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Screen 3 — final reveal. `baseEarned` is the unboosted sum of $10-per-row
 * rewards from the game; the boosted total (base x 2) is what was already
 * shown as the running counter during gameplay.
 */
export function renderFinalScreen(container, { baseEarned, ctaUrl }) {
  const totalEarned = baseEarned * BOOST_MULTIPLIER;
  const boostDatePill = `${formatBoostDate()} Boost Breakdown`;

  container.innerHTML = `
    <section class="screen final-screen">
      <div class="final-icon">${BADGE_ICON_SVG}</div>

      <p class="final-label">You Could Have Earned</p>
      <p class="final-amount">${formatMoney(totalEarned)}</p>
      <p class="final-subtext">Here is what your 2x Premium Boost could have paid out</p>

      <div class="boost-pill">${boostDatePill}</div>

      <div class="breakdown-box">
        <div class="breakdown-row">
          <span>Game Rewards</span>
          <span class="value">${formatMoney(baseEarned)}</span>
        </div>
        <div class="breakdown-row">
          <span>2x Premium Boost</span>
          <span class="value">+${formatMoney(baseEarned)}</span>
        </div>
        <div class="breakdown-row total">
          <span>Total You Could Have Earned</span>
          <span class="value">${formatMoney(totalEarned)}</span>
        </div>
      </div>

      <div class="final-cta-wrap">
        <a class="cta-button" id="start-earning-btn" href="${ctaUrl}">Start Earning</a>
        <p class="countdown-text">
          Signup within <span class="clock" id="countdown-clock">${formatClock(COUNTDOWN_START_SECONDS)}</span> to claim 2x boost for a week.
        </p>
      </div>
    </section>
  `;

  startCountdown(container.querySelector("#countdown-clock"));
}

function startCountdown(clockEl) {
  let secondsLeft = COUNTDOWN_START_SECONDS;

  const timerId = setInterval(() => {
    secondsLeft -= 1;

    if (secondsLeft <= 0) {
      secondsLeft = 0;
      clockEl.textContent = formatClock(secondsLeft);
      clearInterval(timerId);
      return;
    }

    clockEl.textContent = formatClock(secondsLeft);
  }, 1000);
}
