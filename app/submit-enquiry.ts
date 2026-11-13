/** Netlify's static form endpoint avoids Next.js server route interception. */
export async function submitEnquiry(data: FormData, send: typeof fetch = fetch) {
  const body = new URLSearchParams();
  for (const [key, value] of data.entries()) {
    if (typeof value === "string") body.append(key, value);
  }
  body.set("form-name", "enquiry");
  const contact = String(data.get("contact") ?? "").trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) body.set("email", contact);
  const response = await send("/__forms.html", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error("Enquiry submission was not accepted");
}
