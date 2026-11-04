export type ClearancePreset = {
  id: "cabin" | "checked" | "international";
  label: string;
  minMinutes: number;
  maxMinutes: number;
};

export type WaitingSpot = {
  id: "sunbank" | "jetparks";
  name: string;
  shortName: string;
  note: string;
  driveMinutesToT2: number;
  appleMapsUrl: string;
};

export const clearancePresets: ClearancePreset[] = [
  { id: "cabin", label: "Cabin bags only", minMinutes: 15, maxMinutes: 20 },
  { id: "checked", label: "Checked bags", minMinutes: 30, maxMinutes: 40 },
  { id: "international", label: "Passport control / slower arrival", minMinutes: 45, maxMinutes: 60 },
];

export const manchester = {
  code: "MAN",
  name: "Manchester Airport",
  terminal: "T2",
  waitingSpots: [
    {
      id: "sunbank",
      name: "Sunbank Lane service station",
      shortName: "Sunbank",
      note: "Good when very early: coffee, fuel and a comfortable place to wait.",
      driveMinutesToT2: 9,
      appleMapsUrl: "https://maps.apple.com/?q=Sunbank+Lane+Altrincham",
    },
    {
      id: "jetparks",
      name: "JetParks 1 Private Hire Holding Area",
      shortName: "JetParks 1",
      note: "Use when the flight is getting close and you want to be near the airport.",
      driveMinutesToT2: 5,
      appleMapsUrl: "https://maps.apple.com/?q=JetParks+1+Manchester+Airport",
    },
  ] satisfies WaitingSpot[],
  pickup: {
    name: "Manchester T2 P3 / Express Pick Up",
    appleMapsUrl: "https://maps.apple.com/?q=Manchester+Airport+Terminal+2+P3+Express+Pick+Up",
  },
  cheatSheet: [
    "Sunbank is better when you are very early.",
    "Move to JetParks 1 once the flight is getting close.",
    "Do not enter the paid pickup area just because the aircraft has landed.",
    "Wait for the passenger to confirm they have their bags before committing to pickup.",
    "Follow airport signs near the terminal even if sat-nav wording differs.",
  ],
};
