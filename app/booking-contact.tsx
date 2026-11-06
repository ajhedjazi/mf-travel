export default function BookingContact() {
  const phone = process.env.NEXT_PUBLIC_BOOKING_PHONE?.trim();
  const email = process.env.NEXT_PUBLIC_BOOKING_EMAIL?.trim();
  if (!phone) return null;
  const whatsapp = phone.replace(/\D/g, "").replace(/^0/, "44");
  return (
    <nav className="route-contact-links" aria-label="Contact MF Travel">
      <a href={`tel:${phone}`}>Call MF Travel</a>
      <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a>
      {email && <a href={`mailto:${email}`}>Email</a>}
    </nav>
  );
}
