export const mockItems = [
  {
    id: 1,
    type: "fault",
    title: "Brake system fault",
    location: "Front wheel area - Bus 14",
    severity: "high",
    status: "open",
    notes: "Possible brake pad wear detected near the front left wheel. Requires urgent inspection before next route.",
    inspectionNotes: []
  },
  {
    id: 2,
    type: "fault",
    title: "Electrical signal anomaly",
    location: "Driver control panel - Bus 07",
    severity: "medium",
    status: "open",
    notes: "Intermittent dashboard warning light reported by driver on morning shift.",
    inspectionNotes: []
  },
  {
    id: 3,
    type: "fault",
    title: "Engine oil pressure low",
    location: "Engine bay - Bus 22",
    severity: "critical",
    status: "open",
    notes: "Driver reported oil pressure warning on startup. Bus taken out of service pending inspection.",
    inspectionNotes: []
  },
  {
    id: 4,
    type: "fault",
    title: "Suspension noise on turns",
    location: "Suspension system - Bus 03",
    severity: "medium",
    status: "inspected",
    notes: "Knocking sound reported when cornering. Likely worn suspension bush.",
    inspectionNotes: [
      { text: "Confirmed worn rear suspension bush. Replacement scheduled for next maintenance slot.", createdAt: "10/05/2026, 09:15:00" }
    ]
  },
  {
    id: 5,
    type: "fault",
    title: "Hydraulic door not closing",
    location: "Rear passenger door - Bus 19",
    severity: "high",
    status: "open",
    notes: "Rear door fails to fully seal. Hydraulic actuator suspected. Bus operational with door taped.",
    inspectionNotes: []
  },
  {
    id: 6,
    type: "fault",
    title: "Windscreen wiper failure",
    location: "Driver cab - Bus 14",
    severity: "low",
    status: "inspected",
    notes: "Passenger-side wiper not operating. Fuse replaced and wiper motor tested.",
    inspectionNotes: [
      { text: "Replaced blown fuse F12. Wiper fully operational. Ready for service.", createdAt: "09/05/2026, 14:30:00" }
    ]
  },
  {
    id: 7,
    type: "fault",
    title: "ABS warning light active",
    location: "Brake system - Bus 07",
    severity: "high",
    status: "open",
    notes: "ABS warning illuminated after overnight parking. Wheel speed sensor suspected.",
    inspectionNotes: []
  },
  {
    id: 8,
    type: "tool",
    title: "Torque wrench (250 Nm)",
    location: "Tool board A",
    severity: "medium",
    status: "missing",
    notes: "Expected to be returned after brake caliper job on Bus 14.",
    inspectionNotes: []
  },
  {
    id: 9,
    type: "tool",
    title: "Inspection torch",
    location: "Tool board B",
    severity: "low",
    status: "returned",
    notes: "Returned after tunnel undercarriage inspection task.",
    inspectionNotes: []
  },
  {
    id: 10,
    type: "tool",
    title: "Hydraulic floor jack (3T)",
    location: "Tool bay 2",
    severity: "high",
    status: "missing",
    notes: "Checked out for suspension work on Bus 03. Should be returned by end of shift.",
    inspectionNotes: []
  },
  {
    id: 11,
    type: "tool",
    title: "OBD-II diagnostic scanner",
    location: "Tool board A",
    severity: "medium",
    status: "returned",
    notes: "Used to read ABS fault codes on Bus 07. Returned and charging.",
    inspectionNotes: []
  },
  {
    id: 12,
    type: "fault",
    title: "Coolant leak detected",
    location: "Engine bay - Bus 22",
    severity: "critical",
    status: "open",
    notes: "Coolant level dropped significantly overnight. Small leak at hose clamp joint.",
    inspectionNotes: []
  }
];
