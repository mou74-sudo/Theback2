export const mockItems = [
  {
    id: 1,
    type: "fault",
    title: "Brake system fault",
    location: "Front wheel area",
    severity: "high",
    status: "open",
    notes: "Possible brake wear detected near the front wheel.",
    inspectionNotes: []
  },
  {
    id: 2,
    type: "fault",
    title: "Electrical signal anomaly",
    location: "Driver control panel",
    severity: "medium",
    status: "open",
    notes: "Intermittent dashboard warning light reported.",
    inspectionNotes: []
  },
  {
    id: 3,
    type: "tool",
    title: "Torque wrench",
    location: "Tool board A",
    severity: "medium",
    status: "missing",
    notes: "Expected to be returned after brake inspection.",
    inspectionNotes: []
  },
  {
    id: 4,
    type: "tool",
    title: "Inspection torch",
    location: "Tool board B",
    severity: "low",
    status: "returned",
    notes: "Returned after tunnel inspection task.",
    inspectionNotes: []
  }
];