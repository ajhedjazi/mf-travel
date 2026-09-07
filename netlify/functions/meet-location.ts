import { getStore } from "@netlify/blobs";

type Role = "driver" | "passenger";

type StoredLocation = {
  lat: number;
  lng: number;
  accuracy: number;
  updatedAt: number;
  expiresAt: number;
};

const SESSION_PATTERN = /^[a-f0-9]{12}$/i;
const SESSION_LIFETIME_MS = 2 * 60 * 60 * 1000;
const store = getStore("mf-live-meet");

function keyFor(sessionId: string, role: Role) {
  return `${sessionId}/${role}`;
}

function validCoordinate(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

async function readLocation(sessionId: string, role: Role) {
  const key = keyFor(sessionId, role);
  const value = await store.get(key, { type: "json", consistency: "strong" }) as StoredLocation | null;

  if (!value) return null;
  if (value.expiresAt <= Date.now()) {
    await store.delete(key);
    return null;
  }

  return value;
}

export default async (request: Request) => {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("sessionId")?.trim() ?? "";

  if (!SESSION_PATTERN.test(sessionId)) {
    return Response.json({ error: "Invalid live-meet session." }, { status: 400 });
  }

  if (request.method === "GET") {
    const [driver, passenger] = await Promise.all([
      readLocation(sessionId, "driver"),
      readLocation(sessionId, "passenger"),
    ]);

    return Response.json(
      { driver, passenger },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  if (request.method === "POST") {
    let body: Record<string, unknown>;
    try {
      body = await request.json() as Record<string, unknown>;
    } catch {
      return Response.json({ error: "Invalid JSON." }, { status: 400 });
    }

    const role = body.role;
    if (role !== "driver" && role !== "passenger") {
      return Response.json({ error: "Invalid role." }, { status: 400 });
    }

    if (!validCoordinate(body.lat, -90, 90) || !validCoordinate(body.lng, -180, 180)) {
      return Response.json({ error: "Invalid coordinates." }, { status: 400 });
    }

    const accuracy = typeof body.accuracy === "number" && Number.isFinite(body.accuracy)
      ? Math.max(0, Math.min(body.accuracy, 10_000))
      : 0;
    const now = Date.now();
    const location: StoredLocation = {
      lat: body.lat,
      lng: body.lng,
      accuracy,
      updatedAt: now,
      expiresAt: now + SESSION_LIFETIME_MS,
    };

    await store.setJSON(keyFor(sessionId, role as Role), location, {
      metadata: { expiration: location.expiresAt },
    });

    return Response.json({ ok: true, expiresAt: location.expiresAt });
  }

  return new Response("Method not allowed", {
    status: 405,
    headers: { Allow: "GET, POST" },
  });
};
