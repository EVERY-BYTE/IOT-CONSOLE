/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Card, Box, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
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
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const currentUser = await firebaseAuth.getCurrentUser();
        setCurrentUser(currentUser);
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
    TDS: <WaterIcon fontSize="large" sx={{ color: "#2196f3" }} />,
    TEMPERATURE: <ThermostatIcon fontSize="large" sx={{ color: "#ff5722" }} />,
    HUMIDITY: <OpacityIcon fontSize="large" sx={{ color: "#4caf50" }} />,
    PH: <ScienceIcon fontSize="large" sx={{ color: "#9c27b0" }} />,
    DEFAULT: <ScienceIcon fontSize="large" />,
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f4f6f8", minHeight: "100vh" }}>
      {currentUser && (
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: "text.primary",
            mb: 3,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          Welcome back, {currentUser.displayName || "User"}!
        </Typography>
      )}

      {Object.keys(groupedDevices).length === 0 ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "70vh",
            textAlign: "center",
          }}
        >
          <Typography variant="h5" color="textSecondary">
            No devices found. <br />
            <Typography variant="body1" component="span">
              Add your first device to see dashboard metrics
            </Typography>
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {Object.entries(groupedDevices).map(([deviceType, devices]) => (
            <Grid
              container
              rowSpacing={2}
              columnSpacing={{ xs: 1, sm: 2, md: 3 }}
              key={deviceType}
            >
              <Card
                sx={{
                  p: 3,
                  // height: 180,
                  boxShadow: 3,
                  borderRadius: 4,
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    boxShadow: 6,
                    transform: "translateY(-4px)",
                  },
                  background: "linear-gradient(145deg, #ffffff, #f8f9fa)",
                }}
              >
                <Stack direction="row" spacing={3} alignItems="center">
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "#f8f9fa",
                      borderRadius: 2,
                      display: "flex",
                      boxShadow: 1,
                    }}
                  >
                    {iconMapping[deviceType as keyof typeof iconMapping] ||
                      iconMapping.DEFAULT}
                  </Box>
                  <Stack justifyContent="center">
                    <Typography
                      color="textSecondary"
                      variant="subtitle1"
                      sx={{ fontWeight: 600, textTransform: "uppercase" }}
                    >
                      {deviceType === "HUMADITY" ? "HUMIDITY" : deviceType}
                    </Typography>
                    <Typography
                      fontSize="2rem"
                      fontWeight="bold"
                      sx={{ color: "primary.main" }}
                    >
                      {devices.length}
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ ml: 1, color: "text.secondary" }}
                      >
                        devices
                      </Typography>
                    </Typography>
                    {/* <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        mt: 1,
                        display: "block",
                      }}
                    >
                      Name: {devices[0]?.deviceName || "N/A"}
                    </Typography> */}
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

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
