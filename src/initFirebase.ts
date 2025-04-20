import { database, ref, set } from "./configs";

// Reference to the TDS data in the database
const tdsRef = ref(database, "sensor/TDS");

// Initial TDS sensor data
const initialData = {
  1: {
    value: 300,
    timestamp: Date.now() - 600000, // 10 minutes ago
  },
  2: {
    value: 350,
    timestamp: Date.now() - 300000, // 5 minutes ago
  },
  3: {
    value: 320,
    timestamp: Date.now() - 180000, // 3 minutes ago
  },
  4: {
    value: 310,
    timestamp: Date.now() - 60000, // 1 minute ago
  },
  5: {
    value: 340,
    timestamp: Date.now(), // Current time
  },
};

// Add the initial data to Firebase

export function initFirebase() {
  set(tdsRef, initialData)
    .then(() => {
      console.log("Initial TDS data added successfully");
    })
    .catch((error) => {
      console.error("Error adding initial data:", error);
    });
}
