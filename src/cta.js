const BASE_AFFILIATE_URL = "https://giftclick.org/aff_c?offer_id=4615&aff_id=150406";

/**
 * Builds the affiliate CTA URL for this visit. If the incoming page URL has
 * a `source` query param, it's forwarded onto the affiliate link as
 * `&source=<value>`; otherwise the base URL is used unmodified (no empty
 * `&source=` param is ever appended).
 */
export function buildCtaUrl() {
  const params = new URLSearchParams(window.location.search);
  const source = params.get("source");

  if (source) {
    return `${BASE_AFFILIATE_URL}&source=${encodeURIComponent(source)}`;
  }

  return BASE_AFFILIATE_URL;
}
