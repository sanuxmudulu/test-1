const NY_TIME_ZONE = "America/New_York";

function ordinalSuffix(day) {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

/**
 * Returns e.g. "July 18th" for "now" as observed in the America/New_York
 * timezone (handles EST/EDT automatically via Intl), with no year.
 */
export function formatBoostDate(date = new Date()) {
  const month = new Intl.DateTimeFormat("en-US", {
    timeZone: NY_TIME_ZONE,
    month: "long",
  }).format(date);

  const day = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: NY_TIME_ZONE,
      day: "numeric",
    }).format(date)
  );

  return `${month} ${day}${ordinalSuffix(day)}`;
}
