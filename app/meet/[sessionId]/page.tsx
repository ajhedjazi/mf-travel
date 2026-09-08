import type { Metadata } from "next";
import BrandLogo from "../../brand-logo";
import LiveMeet from "../live-meet";
import styles from "../../driver/driver.module.css";

export const metadata: Metadata = {
  title: "Live pickup · MF Travel",
  description: "Private live pickup location for an MF Travel journey.",
  robots: { index: false, follow: false },
};

export default async function PassengerMeetPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const valid = /^[a-f0-9]{12}$/i.test(sessionId);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div>
            <p className={styles.kicker}>Private pickup link</p>
            <h1 className={styles.title}>Find your driver</h1>
          </div>
          <BrandLogo variant="horizontal" tone="light" className={styles.brand} />
        </header>

        <div className={styles.grid}>
          <section className={`${styles.card} ${styles.sectionCard}`}>
            <h2 className={styles.sectionTitle}>Meet at the airport</h2>
            <p className={styles.passengerIntro}>Tap <strong>Share my live location</strong>. Your driver can then see where you are, and you’ll see the driver appear here too. Keep this page open while you’re finding each other.</p>
            {valid ? <LiveMeet sessionId={sessionId} role="passenger" /> : <p className={styles.liveError}>This pickup link is invalid.</p>}
          </section>

          <p className={styles.notice}>Only share your location when you’re comfortable doing so. The live pickup session expires automatically after 2 hours.</p>
        </div>
      </div>
    </main>
  );
}
