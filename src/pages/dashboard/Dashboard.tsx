/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Card, Grid, Box, Stack, Typography } from "@mui/material";
import WaterIcon from "@mui/icons-material/Water";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import OpacityIcon from "@mui/icons-material/Opacity";
import ScienceIcon from "@mui/icons-material/Science";
import { IDeviceModel } from "../../models/deviceModel";
import { firebaseDb } from "../../firebase/db";
import { removeDotsFromEmail } from "../../utilities/removeDotsFromEmail";
import { firebaseAuth } from "../../firebase/auth";

const DashboardView: React.FC = () => {
  const [groupedDevices, setGroupedDevices] = useState<{
    [key: string]: IDeviceModel[];
  }>({});

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const currentUser = await firebaseAuth.getCurrentUser();
        const email = removeDotsFromEmail(currentUser?.email ?? "");
        const data = await firebaseDb.readAll<{ [key: string]: IDeviceModel }>(
          `${email}/devices`
        );

        const devicesArray = Object.entries(data).map(([deviceId, device]) => ({
          ...device,
          id: deviceId,
          deviceId,
        }));

        const grouped = devicesArray.reduce((acc, device: any) => {
          const type = device.deviceType;
          acc[type] = acc[type] || [];
          acc[type].push(device);
          return acc;
        }, {} as { [key: string]: IDeviceModel[] });

        // setDevices(devicesArray);
        setGroupedDevices(grouped);
      } catch (error) {
        console.error("Error fetching devices:", error);
      }
    };

    fetchDevices();
  }, []);

  const iconMapping = {
    TDS: <WaterIcon fontSize="large" />,
    TEMPERATURE: <ThermostatIcon fontSize="large" />,
    HUMADITY: <OpacityIcon fontSize="large" />,
    PH: <ScienceIcon fontSize="large" />,
    DEFAULT: <ScienceIcon fontSize="large" />,
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f4f6f8" }}>
      <Grid container spacing={3} mb={3}>
        {Object.entries(groupedDevices).map(([deviceType, devices]) => {
          const displayType =
            deviceType === "HUMADITY" ? "HUMIDITY" : deviceType;
          return (
            <Grid item xs={12} sm={6} md={3} key={deviceType}>
              <Card
                sx={{
                  p: 3,
                  minWidth: 200,
                  height: 150,
                  boxShadow: 2,
                  borderRadius: 2,
                  transition: "0.3s",
                  "&:hover": { boxShadow: 5 },
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  {iconMapping[deviceType as keyof typeof iconMapping] ||
                    iconMapping.DEFAULT}
                  <Stack justifyContent="center">
                    <Typography color="textSecondary" variant="subtitle1">
                      {displayType}
                    </Typography>
                    <Typography fontSize="1.8rem" fontWeight="bold">
                      {devices.length}
                    </Typography>
                    <Typography variant="caption">
                      Last updated: {devices[0]?.deviceName || "N/A"}
                    </Typography>
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* <Grid container spacing={3} mt={3}>
        {[
          {
            name: "TDS",
            data: tdsData,
            timestamps: tdsTimestamps,
            color: "#00bcd4",
          },
          {
            name: "Temperature",
            data: temperatureData,
            timestamps: tdsTimestamps,
            color: "#ff5722",
          },
          {
            name: "Humidity",
            data: humidityData,
            timestamps: tdsTimestamps,
            color: "#4caf50",
          },
          {
            name: "pH",
            data: phData,
            timestamps: tdsTimestamps,
            color: "#8e44ad",
          },
        ].map((sensor, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Card sx={{ p: { xs: 2, md: 4 }, boxShadow: 2, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                {sensor.name} Sensor Data Over Time
              </Typography>
              {loading ? (
                <CircularProgress />
              ) : (
                <ReactApexChart
                  options={{
                    chart: { height: 350, type: "area" },
                    colors: [sensor.color],
                    dataLabels: { enabled: false },
                    stroke: { curve: "smooth", width: 2 },
                    xaxis: { type: "datetime", categories: sensor.timestamps },
                    tooltip: { x: { format: "dd/MM/yy HH:mm" } },
                  }}
                  series={[
                    { name: `${sensor.name} (units)`, data: sensor.data },
                  ]}
                  type="area"
                  height={350}
                />
              )}
            </Card>
          </Grid>
        ))}
      </Grid> */}
    </Box>
  );
};

export default DashboardView;
