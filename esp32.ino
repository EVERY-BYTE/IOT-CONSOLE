#include <WiFi.h>
#include <FirebaseESP32.h>
#include <random>

// Wi-Fi credentials
#define WIFI_SSID "your_wifi_ssid"
#define WIFI_PASSWORD "your_wifi_password"

// Firebase credentials
#define FIREBASE_HOST "your_firebase_project.firebaseio.com"
#define FIREBASE_AUTH "your_firebase_database_secret"

// Create Firebase Data object
FirebaseData firebaseData;

// Paths for each sensor in Firebase
String sensorPath = "sensor";
int entryCount = 5; // Number of entries to maintain for each sensor

void setup() {
  Serial.begin(115200);
  
  // Connect to Wi-Fi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println(" connected");

  // Initialize Firebase
  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
  Firebase.reconnectWiFi(true);
  
  if (!Firebase.beginStream(firebaseData, "/sensor")) {
    Serial.println("Could not connect to Firebase");
    Serial.println(firebaseData.errorReason());
  }
}

void loop() {
  // Generate random sensor data for testing
  float tdsValues[5] = {455, 356, 327, 407, 582};         // Sample TDS values
  float tempValues[5] = {25.4, 26.1, 24.9, 26.5, 25.0};    // Sample temperature values
  float humidityValues[5] = {60, 63, 58, 65, 62};          // Sample humidity values
  float phValues[5] = {7.2, 6.9, 7.0, 7.3, 6.8};           // Sample pH values

  unsigned long baseTimestamp = 1690848000000; // Starting timestamp for the sample data

  FirebaseJson json; // Main JSON object

  // Loop through each entry count to create historical data
  for (int i = 0; i < entryCount; i++) {
    String entryKey = String(i + 1); // Keys "1", "2", "3", etc.
    unsigned long timestamp = baseTimestamp + (i * 86400000); // Increment timestamp daily

    // TDS data
    FirebaseJson tdsData;
    tdsData.set("value", tdsValues[i]);
    tdsData.set("timestamp", timestamp);
    json.set(sensorPath + "/TDS/" + entryKey, tdsData);

    // pH data
    FirebaseJson pHData;
    pHData.set("value", phValues[i]);
    pHData.set("timestamp", timestamp);
    json.set(sensorPath + "/pH/" + entryKey, pHData);

    // Temperature data
    FirebaseJson tempData;
    tempData.set("value", tempValues[i]);
    tempData.set("timestamp", timestamp);
    json.set(sensorPath + "/temperature/" + entryKey, tempData);

    // Humidity data
    FirebaseJson humidityData;
    humidityData.set("value", humidityValues[i]);
    humidityData.set("timestamp", timestamp);
    json.set(sensorPath + "/humidity/" + entryKey, humidityData);
  }

  // Push JSON data to Firebase
  if (Firebase.setJSON(firebaseData, sensorPath, json)) {
    Serial.println("Data sent to Firebase:");
    Serial.println(json.raw());
  } else {
    Serial.println("Failed to send data to Firebase");
    Serial.println(firebaseData.errorReason());
  }

  // Wait for the next transmission
  delay(10000); // Send data every 10 seconds
}
