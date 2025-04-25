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
#include <OneWire.h>
#include <DallasTemperature.h>
#include <WiFi.h>
#include <FirebaseESP32.h>

${devicePin}

#define WIFI_SSID "Your_SSID"
#define WIFI_PASSWORD "Your_Password"

#define FIREBASE_HOST "${esp32Config.firebaseHost}"
#define FIREBASE_AUTH "${esp32Config.firebaseAuth}"
#define USER_NAME "${esp32Config.userEmail}"

${deviceDefinitions}

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
  ${devicePaths}

  Serial.print("Temperature: ");
  Serial.print(temperatureC);
  Serial.println(" °C");

  Serial.print("Soil Moisture: ");
  Serial.print(soilMoisturePercent);
  Serial.println("%");

  delay(5000); 
}`;

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
