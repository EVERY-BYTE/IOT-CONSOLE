#include <WiFi.h>
#include <FirebaseESP32.h>
#include <WiFiUdp.h>

#define SOIL_MOISTURE_PIN 16
#define WIFI_SSID ""
#define WIFI_PASSWORD ""
#define FIREBASE_HOST "https://console-iot-default-rtdb.asia-southeast1.firebasedatabase.app/"
#define FIREBASE_AUTH "AIzaSyC3fjOk-Xs7vN4eqbPbvgKzmhTCjo9DOQM"
#define USER_NAME ""
#define SOIL_SENSOR_ID ""

const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 7 * 3600;
const int daylightOffset_sec = 0;

FirebaseData firebaseData;
FirebaseAuth auth;
FirebaseConfig config;
WiFiUDP udp;

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi...");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println(" Connected!");

  config.host = FIREBASE_HOST;
  config.signer.tokens.legacy_token = FIREBASE_AUTH;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  Serial.println("Setting up NTP...");
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    Serial.println("Failed to obtain time from NTP.");
  } else {
    Serial.print("Current time: ");
    Serial.println(&timeinfo, "%A, %B %d %Y %H:%M:%S");
  }
}

void loop() {
  int soilMoistureValue = analogRead(SOIL_MOISTURE_PIN);
  float soilMoisturePercent = constrain(map(soilMoistureValue, 1023, 0, 0, 100), 0, 100);

  struct tm timeinfo;
  time_t epochTime;
  if (getLocalTime(&timeinfo)) {
    epochTime = mktime(&timeinfo);
  } else {
    epochTime = millis() / 1000;
    Serial.println("Failed to get NTP time for timestamp, using uptime.");
  }

  Serial.println("time");
  Serial.println(epochTime);

  FirebaseJson soilJson;
  soilJson.set("value", soilMoistureValue);
  soilJson.set("timestamp", (unsigned long)epochTime);

  if (Firebase.pushJSON(firebaseData, "/" USER_NAME "/deviceData/" SOIL_SENSOR_ID, soilJson)) {
    Serial.println("Data sent to Firebase with NTP timestamp.");
  } else {
    Serial.print("Firebase push failed: ");
    Serial.println(firebaseData.errorReason());
  }

  Serial.print("Soil Moisture: ");
  Serial.print(soilMoisturePercent);
  Serial.println("%");

  Serial.print("Soil Moisture Analog: ");
  Serial.print(soilMoistureValue);

  delay(60000); // Delay 60 seconds
}