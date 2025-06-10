#include <WiFi.h>
#include <FirebaseESP32.h>
#include <WiFiUdp.h>
#include <DHT.h>
#include <OneWire.h>
#include <DallasTemperature.h>

#define SOIL_MOISTURE_PIN 16
#define LDR_PIN 35
#define DHT_PIN 4
#define DHT_TYPE DHT11
#define DS18B20_PIN 5  

DHT dht(DHT_PIN, DHT_TYPE);
OneWire oneWire(DS18B20_PIN);
DallasTemperature ds18b20(&oneWire);

#define WIFI_SSID ""
#define WIFI_PASSWORD ""

#define FIREBASE_HOST "${firebaseConfig.databaseURL}"
#define FIREBASE_AUTH "${firebaseConfig.apiKey}"

#define USER_NAME "${esp32Config.userEmail}"

// isi sensor ID-nya supaya bisa kirim data
const char* SOIL_SENSOR_ID = "";
const char* LDR_SENSOR_ID  = "";
const char* DHT_TEMPERATURE_SENSOR_ID  = "";
const char* DHT_HUMIDITY_SENSOR_ID = "";
const char* DS18B20_SENSOR_ID = "";

const char* ntpServer = "id.pool.ntp.org";
const long gmtOffset_sec = 7 * 3600;
const int daylightOffset_sec = 0;

FirebaseData firebaseData;
FirebaseAuth auth;
FirebaseConfig config;
WiFiUDP udp;

void setup() {
  Serial.begin(115200);

  pinMode(SOIL_MOISTURE_PIN, INPUT);
  pinMode(LDR_PIN, INPUT);
  
  dht.begin();
  ds18b20.begin();

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

  if (strlen(SOIL_SENSOR_ID) > 0) {
    int soilMoistureValue = analogRead(SOIL_MOISTURE_PIN);

    FirebaseJson soilJson;
    soilJson.set("value", soilMoistureValue);
    soilJson.set("timestamp", (unsigned long)epochTime);

    if (Firebase.pushJSON(firebaseData, String("/") + USER_NAME + "/deviceData/" + SOIL_SENSOR_ID, soilJson)) {
      Serial.println("Soil Moisture sent to Firebase");
    } else {
      Serial.print("Soil Moisture data failed: ");
      Serial.println(firebaseData.errorReason());
    }

    Serial.print("Soil Moisture: ");
    Serial.println(soilMoistureValue);
  }

  if (strlen(LDR_SENSOR_ID) > 0) {
    int ldrValue = analogRead(LDR_PIN);

    FirebaseJson ldrJson;
    ldrJson.set("value", ldrValue);
    ldrJson.set("timestamp", (unsigned long)epochTime);

    if (Firebase.pushJSON(firebaseData, String("/") + USER_NAME + "/deviceData/" + LDR_SENSOR_ID, ldrJson)) {
      Serial.println("LDR data sent.");
    } else {
      Serial.print("LDR data failed: ");
      Serial.println(firebaseData.errorReason());
    }

    Serial.print("LDR: ");
    Serial.println(ldrValue);
  }
  
  float temperature = dht.readTemperature();
  if (strlen(DHT_TEMPERATURE_SENSOR_ID) > 0 && !isnan(temperature)) {

    int tempInt = round(temperature);

    FirebaseJson tempJson;
    tempJson.set("value", tempInt);
    tempJson.set("timestamp", (unsigned long)epochTime);

    if (Firebase.pushJSON(firebaseData, String("/") + USER_NAME + "/deviceData/" + DHT_TEMPERATURE_SENSOR_ID, tempJson)) {
      Serial.println("Temperature sent.");
    } else {
      Serial.print("Temperature failed: ");
      Serial.println(firebaseData.errorReason());
    }

    Serial.print("Temperature: ");
    Serial.print(tempInt);
    Serial.println(" °C");
  }

  float humidity = dht.readHumidity();
  if (strlen(DHT_HUMIDITY_SENSOR_ID) > 0 && !isnan(humidity)) {

    int humidInt = round(humidity);

    FirebaseJson humidJson;
    humidJson.set("value", humidInt);
    humidJson.set("timestamp", (unsigned long)epochTime);

    if (Firebase.pushJSON(firebaseData, String("/") + USER_NAME + "/deviceData/" + DHT_HUMIDITY_SENSOR_ID, humidJson)) {
      Serial.println("Humidity sent.");
    } else {
      Serial.print("Humidity failed: ");
      Serial.println(firebaseData.errorReason());
    }

    Serial.print("Humidity: ");
    Serial.print(humidInt);
    Serial.println(" %");
  }

  if (strlen(DS18B20_SENSOR_ID) > 0) {
    ds18b20.requestTemperatures();
    float dsTemp = ds18b20.getTempCByIndex(0);

    if (!isnan(dsTemp)) {
      FirebaseJson dsJson;
      dsJson.set("value", dsTemp);
      dsJson.set("timestamp", (unsigned long)epochTime);

      if (Firebase.pushJSON(firebaseData, String("/") + USER_NAME + "/deviceData/" + DS18B20_SENSOR_ID, dsJson)) {
        Serial.println("DS18B20 temperature sent.");
      } else {
        Serial.print("DS18B20 failed: ");
        Serial.println(firebaseData.errorReason());
      }

      Serial.print("DS18B20 Temp: ");
      Serial.println(dsTemp);
    }
  }

  delay(60000 * 30); // Delay 60 seconds x 30 = 30 menit
}