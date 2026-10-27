/**
 * Messages are passed between pages as short codes rather than text, so a link
 * can never be crafted to make the portal say something it doesn't mean.
 */
const MESSAGES: Record<string, { tone: "good" | "bad"; text: string }> = {
  "clocked-in": { tone: "good", text: "You're clocked in." },
  "clocked-out": { tone: "good", text: "You're clocked out." },
  "already-in": { tone: "bad", text: "You're already clocked in." },
  "not-in": { tone: "bad", text: "You weren't clocked in." },
  "note-saved": { tone: "good", text: "Note saved." },
  "report-sent": { tone: "good", text: "Report sent." },
  "report-sent-out": { tone: "good", text: "Report sent, and you're clocked out." },
  "need-did": { tone: "bad", text: "Write a few lines about what you did today." },
  "need-reasons": { tone: "bad", text: "Each unchecked duty needs a reason before the report can go in." },
  "owner-note": { tone: "good", text: "Note posted for today." },
  "owner-note-cleared": { tone: "good", text: "Today's note cleared." },
  "reviewed": { tone: "good", text: "Reply saved and the day is marked reviewed." },
  "duty-added": { tone: "good", text: "Duty added." },
  "duty-saved": { tone: "good", text: "Duty saved." },
  "duty-paused": { tone: "good", text: "Paused. It's off the daily list until you resume it." },
  "duty-resumed": { tone: "good", text: "Back on the daily list." },
  "duty-deleted": { tone: "good", text: "Deleted. Past days still show it." },
  "need-title": { tone: "bad", text: "Give the duty a name." },
  "need-days": { tone: "bad", text: "Pick at least one weekday, a day of the month, or a date." },
  "starter": { tone: "good", text: "Starter duties added. Edit or delete any of them." },
  "sent": { tone: "good", text: "Message sent." },
  "need-body": { tone: "bad", text: "Write something first." },
  "shift-fixed": { tone: "good", text: "Shift times corrected." },
  "bad-time": { tone: "bad", text: "Clock-out has to be after clock-in." },
  "not-yours": { tone: "bad", text: "That's on the other person's side of the portal." },
  "grocery-added": { tone: "good", text: "Added to the grocery list." },
  "grocery-got": { tone: "good", text: "Checked off." },
  "grocery-got-staple": { tone: "good", text: "Checked off, and the pantry count is updated." },
  "grocery-undone": { tone: "good", text: "Back on the list." },
  "grocery-removed": { tone: "good", text: "Removed from the list." },
  "grocery-cleared": { tone: "good", text: "Picked-up list cleared." },
  "need-name": { tone: "bad", text: "Type what it is first." },
  "need-bought": { tone: "bad", text: "Enter how many you bought, so the pantry count stays right." },
  "count-saved": { tone: "good", text: "Count updated." },
  "bad-number": { tone: "bad", text: "Use a whole number, 0 or more." },
  "staple-added": { tone: "good", text: "Staple added. If it's already at or below its minimum, it's on the grocery list." },
  "staple-saved": { tone: "good", text: "Staple saved." },
  "staple-deleted": { tone: "good", text: "Staple deleted." },
  "prep-added": { tone: "good", text: "Added to the prep list." },
  "prep-saved": { tone: "good", text: "Prep item saved." },
  "prep-deleted": { tone: "good", text: "Prep item deleted." },
  "prep-copied": { tone: "good", text: "Last week's prep list copied in. Edit anything that's changed." },
  "prep-note": { tone: "good", text: "Note saved." },
  "notice-sent": { tone: "good", text: "Note sent. It's at the top of her Today screen until she taps Got it." },
  "notice-seen": { tone: "good", text: "Marked as seen. The owner can see you got it." },
  "notice-done": { tone: "good", text: "Marked done. The owner can see it." },
  "notice-deleted": { tone: "good", text: "Note deleted." },
  "pay-saved": { tone: "good", text: "Pay settings saved." },
  "bad-pay": { tone: "bad", text: "Use a number for both, like 25 or 25.50 for the rate and 20 for the hours." },
  oops: { tone: "bad", text: "That didn't go through. Please try again." },
};

export function flashFor(code: string | null) {
  if (!code) return null;
  return MESSAGES[code] ?? null;
}

/** Trimmed text from a form, capped so nobody can post a novel into one field. */
export function field(v: FormDataEntryValue | null, max = 4000): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

/** Where a note action returns to — only ever one of these two pages. */
export const safeBack = (b: string) => (b === "/notes" ? "/notes" : "/today");
