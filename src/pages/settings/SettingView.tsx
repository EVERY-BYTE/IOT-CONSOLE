/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Box, Card, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { firebaseDb } from "../../firebase/db";
import { firebaseAuth } from "../../firebase/auth";
import { removeDotsFromEmail } from "../../utilities/removeDotsFromEmail";

export default function SettingView() {
  const [deviceData, setDeviceData] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = firebaseAuth.getCurrentUser();
  const email = removeDotsFromEmail(currentUser?.email ?? "");

  console.log(deviceData);

  const esp32Config = {
    firebaseHost:
      "https://monitoring-sensor-tds-default-rtdb.asia-southeast1.firebasedatabase.app/",
    firebaseAuth: "46Z3c44eIaTWYqMCN42zGLIzgBagdmGG36IHfeaZ",
    userEmail: "fuckss@mailcom",
    tempDeviceId: "2f8ba393-02fb-477a-b4f6-2c6696d8c36f",
    tdsDeviceId: "39fce607-b91a-438b-9725-b9137df5ff28",
  };

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

  const configRows = [
    {
      id: 1,
      variable: "FIREBASE_HOST",
      value: esp32Config.firebaseHost,
    },
    { id: 2, variable: "FIREBASE_AUTH", value: esp32Config.firebaseAuth },
    {
      id: 3,
      variable: "USER_EMAIL",
      value: esp32Config.userEmail,
    },
    {
      id: 4,
      variable: "TEMP_DEVICE_ID",
      value: esp32Config.tempDeviceId,
    },
    {
      id: 5,
      variable: "TDS_DEVICE_ID",
      value: esp32Config.tdsDeviceId,
    },
  ];

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
        setDeviceData(devices);
      } catch (error) {
        console.error("Error fetching device data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeviceData();
  }, [email]);

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
          />
        </Box>
      </Card>
    </Box>
  );
}
