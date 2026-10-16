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
  "need-days": { tone: "bad", text: "Pick at least one day, or make it a one-time duty with a date." },
  "starter": { tone: "good", text: "Starter duties added. Edit or delete any of them." },
  "sent": { tone: "good", text: "Message sent." },
  "need-body": { tone: "bad", text: "Write something first." },
  "shift-fixed": { tone: "good", text: "Shift times corrected." },
  "bad-time": { tone: "bad", text: "Clock-out has to be after clock-in." },
  "not-yours": { tone: "bad", text: "That's on the other person's side of the portal." },
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
