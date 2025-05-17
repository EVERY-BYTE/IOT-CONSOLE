/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Box, Card, Typography, Button } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { firebaseDb } from "../../firebase/db";
import { firebaseAuth } from "../../firebase/auth";
import { removeDotsFromEmail } from "../../utilities/removeDotsFromEmail";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { IDeviceModel } from "../../models/deviceModel";

export default function SettingView() {
  const [loading, setLoading] = useState(true);
  const [esp32Code, setEsp32Code] = useState<string>("");
  const currentUser = firebaseAuth.getCurrentUser();
  const email = removeDotsFromEmail(currentUser?.email ?? "");

  const esp32Config = {
    firebaseHost:
      "https://monitoring-sensor-tds-default-rtdb.asia-southeast1.firebasedatabase.app/",
    firebaseAuth: "46Z3c44eIaTWYqMCN42zGLIzgBagdmGG36IHfeaZ",
    userEmail: email,
  };

  useEffect(() => {
    const fetchDeviceData = async () => {
      try {
        const path = `${email}/devices`;
        const data = await firebaseDb.readAll(path);
        const devices = Object.entries(data).map(([deviceId, device]) => ({
          id: deviceId,
          deviceId,
          ...(device as any),
        }));
        generateEsp32Code(devices);
      } catch (error) {
        console.error("Error fetching device data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeviceData();
  }, [email]);

  const generateEsp32Code = (devices: IDeviceModel[]) => {
    console.log("Generating ESP32 code...");
    const devicePin = devices
      .map((device) => {
        return `#define ${device.deviceName.toUpperCase()}_${device.deviceType.toUpperCase()}_PIN //your pin`;
      })
      .join("\n");

    const deviceDefinitions = devices
      .map(
        (device) =>
          `#define ${device.deviceName.toUpperCase()}_DEVICE_ID "${
            device.deviceId
          }"`
      )
      .join("\n");

    const devicePaths = devices
      .map(
        (device) => `
// For ${device.deviceName} device
  String ${device.deviceName.toUpperCase()}_PATH = "/" + String(USER_NAME) + "/deviceData/" + ${device.deviceName.toUpperCase()}_DEVICE_ID + "/deviceValue";
  FirebaseJson ${device.deviceName.toUpperCase()}_DATA;
  ${device.deviceName.toUpperCase()}_DATA.set("value", ${
          device.deviceType === "TEMPERATURE"
            ? "temperatureC"
            : "soilMoisturePercent"
        });
  ${device.deviceName.toUpperCase()}_DATA.set("timeStamp", timestamp);
  Firebase.pushJSON(firebaseData, ${device.deviceName.toUpperCase()}_PATH, ${device.deviceName.toUpperCase()}_DATA);`
      )
      .join("\n");

    const code = `
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
`;

    setEsp32Code(code);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(esp32Code);
  };

  const configRows = [
    {
      id: 1,
      variable: "FIREBASE_HOST",
      value: esp32Config.firebaseHost,
    },
    { id: 2, variable: "FIREBASE_AUTH", value: esp32Config.firebaseAuth },
    {
      id: 3,
      variable: "USER_NAME",
      value: esp32Config.userEmail,
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        ESP32 Configuration
      </Typography>

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Firmware Constants
        </Typography>
        <Box sx={{ width: "100%" }}>
          <DataGrid
            rows={configRows}
            columns={configColumns}
            disableRowSelectionOnClick
            hideFooterPagination
            loading={loading}
            autoHeight
          />
        </Box>
      </Card>

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          📌 Petunjuk Upload Kode ke ESP32
        </Typography>
        <Typography
          variant="body2"
          component="div"
          sx={{ whiteSpace: "pre-line" }}
        >
          {`
1. Install Arduino IDE: https://www.arduino.cc/en/software
2. Tambahkan ESP32 board URL ke Preferences:
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
3. Install library: FirebaseESP32
4. Install library NTPClient 
5. Sambungkan ESP32 ke komputer via USB
6. Copy kode di bawah dan paste ke Arduino IDE
7. Isi:
   - WIFI_SSID dan WIFI_PASSWORD
   - SOIL_MOISTURE_PIN
   - FIREBASE_HOST dan FIREBASE_AUTH
   - USER_NAME dan SOIL_SENSOR_ID
8. Upload ke board
9. Lihat Serial Monitor, atur baudrate (115200)
    `}
        </Typography>
      </Card>

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          ESP32 Code
        </Typography>
        <Button variant="outlined" onClick={handleCopyCode} sx={{ mb: 2 }}>
          Copy Code
        </Button>
        <Box sx={{ borderRadius: 1, overflow: "hidden" }}>
          <SyntaxHighlighter
            language="cpp"
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: "16px",
              maxHeight: "500px",
            }}
            showLineNumbers
          >
            {esp32Code}
          </SyntaxHighlighter>
        </Box>
      </Card>
    </Box>
  );
}

const configColumns: GridColDef[] = [
  {
    field: "variable",
    headerName: "Variable Name",
    flex: 1,
    renderCell: (params) => <code>{params.value}</code>,
  },
  {
    field: "value",
    headerName: "Value",
    flex: 2,
    renderCell: (params) => (
      <Typography variant="body2">{params.value}</Typography>
    ),
  },
];
