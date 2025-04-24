#include <OneWire.h>
#include <DallasTemperature.h>
#include <WiFi.h>
#include <FirebaseESP32.h>

#define ONE_WIRE_BUS 4  // Pin data untuk DS18B20 hubungkan pin ke D2
#define SOIL_MOISTURE_PIN A0  // Pin analog untuk sensor kelembaban tanah hubungkan ke pin 0

#define WIFI_SSID "Fakir Bandwith" //ganti bagian ini 
#define WIFI_PASSWORD "qwertyio" //ganti bagian ini

#define FIREBASE_HOST "https://monitoring-sensor-tds-default-rtdb.asia-southeast1.firebasedatabase.app/"
#define FIREBASE_AUTH "46Z3c44eIaTWYqMCN42zGLIzgBagdmGG36IHfeaZ"

#define USER_EMAIL "fuck@mailcom" // Sanitized email (without @ symbol)
#define TEMP_DEVICE_ID "2f8ba393-02fb-477a-b4f6-2c6696d8c36f"
#define TDS_DEVICE_ID "39fce607-b91a-438b-9725-b9137df5ff28"

FirebaseData firebaseData;
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

void setup() {
  Serial.begin(115200);
  sensors.begin();

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println(" connected");

  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
  Firebase.reconnectWiFi(true);
}

void loop() {
  sensors.requestTemperatures(); 
  float temperatureC = sensors.getTempCByIndex(0);

  int soilMoistureValue = analogRead(SOIL_MOISTURE_PIN);
  float soilMoisturePercent = map(soilMoistureValue, 1023, 0, 0, 100); 

  unsigned long timestamp = millis();

  // For Temperature device
  String tempPath = "/" + String(USER_EMAIL) + "/deviceData/" + TEMP_DEVICE_ID + "/deviceData";
  FirebaseJson tempData;
  tempData.set("value", temperatureC);
  tempData.set("timeStamp", timestamp);
  Firebase.pushJSON(firebaseData, tempPath, tempData);

  // For TDS device
  String tdsPath = "/" + String(USER_EMAIL) + "/deviceData/" + TDS_DEVICE_ID + "/deviceData";
  FirebaseJson tdsData;
  tdsData.set("value", soilMoisturePercent);
  tdsData.set("timeStamp", timestamp);
  Firebase.pushJSON(firebaseData, tdsPath, tdsData);

  Serial.print("Temperature: ");
  Serial.print(temperatureC);
  Serial.println(" °C");

  Serial.print("Soil Moisture: ");
  Serial.print(soilMoisturePercent);
  Serial.println("%");

  delay(5000); 
}