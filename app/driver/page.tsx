"use client";

import { useEffect, useMemo, useState } from "react";
import BrandLogo from "../brand-logo";
import { clearancePresets, manchester } from "./airport-data";
import styles from "./driver.module.css";

type PassengerStatus = "none" | "landed" | "bags" | "outside";

function atLocalTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const now = new Date();
  const result = new Date(now);
  result.setHours(hours, minutes, 0, 0);

  const diff = result.getTime() - now.getTime();
  if (diff < -12 * 60 * 60 * 1000) result.setDate(result.getDate() + 1);
  if (diff > 12 * 60 * 60 * 1000) result.setDate(result.getDate() - 1);
  return result;
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000);
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatCountdown(target: Date, now: Date) {
  const totalSeconds = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours > 0
    ? `${hours}h ${String(minutes).padStart(2, "0")}m`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function DriverHub() {
  const [flightNumber, setFlightNumber] = useState("LS1748");
  const [eta, setEta] = useState("03:48");
  const [clearanceId, setClearanceId] = useState("checked");
  const [waitingSpotId, setWaitingSpotId] = useState("sunbank");
  const [passengerStatus, setPassengerStatus] = useState<PassengerStatus>("none");
  const [now, setNow] = useState(() => new Date());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const clearance = clearancePresets.find((item) => item.id === clearanceId) ?? clearancePresets[1];
  const waitingSpot = manchester.waitingSpots.find((item) => item.id === waitingSpotId) ?? manchester.waitingSpots[0];

  const timing = useMemo(() => {
    if (!eta) return null;
    const touchdown = atLocalTime(eta);
    const readyStart = addMinutes(touchdown, clearance.minMinutes);
    const readyEnd = addMinutes(touchdown, clearance.maxMinutes);
    const leaveTime = addMinutes(readyStart, -waitingSpot.driveMinutesToT2);
    return { touchdown, readyStart, readyEnd, leaveTime };
  }, [eta, clearance.minMinutes, clearance.maxMinutes, waitingSpot.driveMinutesToT2]);

  const forcedGo = passengerStatus === "bags" || passengerStatus === "outside";
  const status = useMemo(() => {
    if (!timing) return { key: "wait", title: "WAIT", copy: "Enter an estimated arrival time to calculate your move." };
    if (forcedGo) return { key: "go", title: "GO NOW", copy: "Passenger has their bags. Head to the Terminal 2 pickup point." };

    const minutesToLeave = (timing.leaveTime.getTime() - now.getTime()) / 60_000;
    if (minutesToLeave > 15) {
      return { key: "wait", title: "WAIT", copy: `Stay at ${waitingSpot.shortName}. You are too early to enter pickup.` };
    }
    if (minutesToLeave > 0) {
      return { key: "ready", title: "GET READY", copy: `Flight is getting close. Plan to leave ${waitingSpot.shortName} at ${formatTime(timing.leaveTime)}.` };
    }
    return { key: "go", title: "GO NOW", copy: "Head to Manchester Terminal 2 pickup. Keep an eye out for the passenger message." };
  }, [forcedGo, now, timing, waitingSpot.shortName]);

  const passengerMessage = `Hi, I’m nearby and tracking ${flightNumber || "your flight"}. When you’ve collected your bags and are heading out of Terminal 2, send me a message and I’ll come straight round to the pickup point.`;

  async function copyPassengerMessage() {
    await navigator.clipboard.writeText(passengerMessage);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  const statusClass = status.key === "go" ? styles.go : status.key === "ready" ? styles.ready : styles.wait;

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div>
            <p className={styles.kicker}>Internal operations</p>
            <h1 className={styles.title}>Driver Hub</h1>
          </div>
          <BrandLogo variant="horizontal" tone="light" className={styles.brand} />
        </header>

        <div className={styles.grid}>
          <section className={`${styles.card} ${styles.formCard}`} aria-label="Journey inputs">
            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span className={styles.label}>Flight number</span>
                <input className={styles.input} value={flightNumber} onChange={(event) => setFlightNumber(event.target.value.toUpperCase())} placeholder="LS1748" />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Estimated arrival</span>
                <input className={styles.input} type="time" value={eta} onChange={(event) => setEta(event.target.value)} />
              </label>
              <label className={`${styles.field} ${styles.fieldFull}`}>
                <span className={styles.label}>Clearance estimate</span>
                <select className={styles.select} value={clearanceId} onChange={(event) => setClearanceId(event.target.value)}>
                  {clearancePresets.map((item) => (
                    <option key={item.id} value={item.id}>{item.label} (+{item.minMinutes}–{item.maxMinutes} min)</option>
                  ))}
                </select>
              </label>
              <label className={`${styles.field} ${styles.fieldFull}`}>
                <span className={styles.label}>Where am I waiting?</span>
                <select className={styles.select} value={waitingSpotId} onChange={(event) => setWaitingSpotId(event.target.value)}>
                  {manchester.waitingSpots.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className={`${styles.card} ${styles.summary}`} aria-label="Flight timing summary">
            <div className={styles.flightRow}>
              <div>
                <h2 className={styles.flightNumber}>{flightNumber || "FLIGHT"}</h2>
                <p className={styles.route}>{manchester.name} · private driver estimate</p>
              </div>
              <div className={styles.terminal}>{manchester.terminal}</div>
            </div>

            <div className={styles.metrics}>
              <div className={styles.metric}><span>Estimated arrival</span><strong>{timing ? formatTime(timing.touchdown) : "—"}</strong></div>
              <div className={styles.metric}><span>Passenger likely ready</span><strong>{timing ? `${formatTime(timing.readyStart)}–${formatTime(timing.readyEnd)}` : "—"}</strong></div>
              <div className={styles.metric}><span>Drive to pickup</span><strong>{waitingSpot.driveMinutesToT2} min</strong></div>
              <div className={styles.metric}><span>Recommended leave</span><strong>{timing ? formatTime(timing.leaveTime) : "—"}</strong></div>
            </div>
          </section>

          <section className={`${styles.status} ${statusClass}`} aria-live="polite">
            <p className={styles.statusLabel}>Recommended action</p>
            <h2 className={styles.statusTitle}>{status.title}</h2>
            <p className={styles.statusCopy}>{status.copy}</p>
            <div className={styles.countdown}>
              <span>{status.key === "go" ? "Recommended leave time" : "Time until move"}</span>
              <strong>{timing ? (status.key === "go" ? formatTime(timing.leaveTime) : formatCountdown(timing.leaveTime, now)) : "—"}</strong>
            </div>
          </section>

          <div className={styles.actions} aria-label="Quick actions">
            <a className={styles.action} href={manchester.waitingSpots[0].appleMapsUrl}>Apple Maps · Sunbank</a>
            <a className={styles.action} href={manchester.waitingSpots[1].appleMapsUrl}>Apple Maps · JetParks</a>
            <a className={`${styles.action} ${styles.actionPrimary}`} href={manchester.pickup.appleMapsUrl}>Apple Maps · T2 Pickup</a>
            <button className={styles.action} type="button" onClick={copyPassengerMessage}>{copied ? "Copied ✓" : "Copy passenger text"}</button>
          </div>

          <section className={`${styles.card} ${styles.sectionCard}`}>
            <h2 className={styles.sectionTitle}>Passenger update</h2>
            <label className={styles.field}>
              <span className={styles.label}>Latest passenger status</span>
              <select className={styles.select} value={passengerStatus} onChange={(event) => setPassengerStatus(event.target.value as PassengerStatus)}>
                <option value="none">No message yet</option>
                <option value="landed">Landed / still inside</option>
                <option value="bags">Bags collected</option>
                <option value="outside">Outside now</option>
              </select>
            </label>
            <p className={styles.messageBox}>{passengerMessage}</p>
          </section>

          <section className={`${styles.card} ${styles.sectionCard}`}>
            <h2 className={styles.sectionTitle}>Manchester T2 cheat sheet</h2>
            <ul className={styles.list}>
              {manchester.cheatSheet.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>

          <p className={styles.notice}>Internal timing aid only. Airport rules, charges and pickup arrangements can change; always follow current airport signage and official instructions.</p>
        </div>
      </div>
    </main>
  );
}
