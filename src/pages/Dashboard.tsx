import React, { useState, useEffect } from "react";
import {
  Card,
  Grid,
  Box,
  Stack,
  Typography,
  Button,
  TextField,
  CircularProgress,
} from "@mui/material";
import ReactApexChart from "react-apexcharts";
import * as XLSX from "xlsx";
import WaterIcon from "@mui/icons-material/Water";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import OpacityIcon from "@mui/icons-material/Opacity";
import ScienceIcon from "@mui/icons-material/Science";

interface SensorData {
  value: number;
  timestamp: number;
}

const DashboardView: React.FC = () => {
  const [tdsData, setTdsData] = useState<number[]>([]);
  const [temperatureData, setTemperatureData] = useState<number[]>([]);
  const [humidityData, setHumidityData] = useState<number[]>([]);
  const [phData, setPhData] = useState<number[]>([]);
  const [tdsTimestamps, setTdsTimestamps] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // const fetchSensorData = (
  //   sensor: string,
  //   setData: React.Dispatch<React.SetStateAction<number[]>>,
  //   setTimestamps: React.Dispatch<React.SetStateAction<string[]>>
  // ) => {
  //   const sensorRef = ref(database, `sensor/${sensor}`);
  //   return onValue(
  //     sensorRef,
  //     (snapshot) => {
  //       const data: Record<string, SensorData> | null = snapshot.val();
  //       if (data) {
  //         const values: number[] = [];
  //         const timestamps: string[] = [];
  //         Object.keys(data).forEach((key) => {
  //           values.push(data[key].value);
  //           timestamps.push(new Date(data[key].timestamp).toISOString());
  //         });
  //         setData(values.slice(-10)); // Keep last 10 values
  //         setTimestamps(timestamps.slice(-10)); // Keep last 10 timestamps
  //       }
  //       setLoading(false);
  //     },
  //     (error) => {
  //       console.error(`Error fetching ${sensor} data: `, error);
  //       setLoading(false);
  //     }
  //   );
  // };

  // useEffect(() => fetchSensorData("TDS", setTdsData, setTdsTimestamps), []);
  // useEffect(
  //   () => fetchSensorData("temperature", setTemperatureData, setTdsTimestamps),
  //   []
  // );
  // useEffect(
  //   () => fetchSensorData("humidity", setHumidityData, setTdsTimestamps),
  //   []
  // );
  // useEffect(() => fetchSensorData("pH", setPhData, setTdsTimestamps), []);

  // const handleDownload = () => {
  //   if (!startDate || !endDate) {
  //     alert("Please select a valid date range.");
  //     return;
  //   }

  //   const sensors = [
  //     { name: "TDS", data: tdsData, timestamps: tdsTimestamps },
  //     {
  //       name: "Temperature",
  //       data: temperatureData,
  //       timestamps: tdsTimestamps,
  //     },
  //     { name: "Humidity", data: humidityData, timestamps: tdsTimestamps },
  //     { name: "pH", data: phData, timestamps: tdsTimestamps },
  //   ];

  //   // Initialize a workbook and a flag to check if data exists within the selected range
  //   const workbook = XLSX.utils.book_new();
  //   let dataExists = false;
  //   const allSensorsData: any[] = [];

  //   sensors.forEach((sensor) => {
  //     const filteredData: any[] = [];

  //     // Title and Header Rows for Each Sensor Table
  //     filteredData.push({ Timestamp: `${sensor.name} Sensor Data`, Value: "" });
  //     filteredData.push({ Timestamp: "Timestamp", Value: "Value" });

  //     // Filter data based on the selected date range
  //     sensor.timestamps.forEach((timestamp, index) => {
  //       if (timestamp >= startDate && timestamp <= endDate) {
  //         const entry = {
  //           Timestamp: timestamp,
  //           Value: sensor.data[index],
  //         };
  //         filteredData.push(entry);
  //         allSensorsData.push({ Sensor: sensor.name, ...entry });
  //       }
  //     });

  //     // Add a worksheet for each sensor if data is found
  //     if (filteredData.length > 2) {
  //       // >2 to account for title and header rows
  //       const worksheet = XLSX.utils.json_to_sheet(filteredData, {
  //         skipHeader: true,
  //       });
  //       XLSX.utils.book_append_sheet(workbook, worksheet, sensor.name);
  //       dataExists = true;
  //     }
  //   });

  //   // Add "All Sensors" worksheet if data exists
  //   if (dataExists) {
  //     // Add title and header rows for the combined sheet
  //     const allSensorsSheetData = [
  //       { Sensor: "All Sensors Data", Timestamp: "", Value: "" },
  //       { Sensor: "Sensor", Timestamp: "Timestamp", Value: "Value" },
  //       ...allSensorsData,
  //     ];
  //     const allSensorsWorksheet = XLSX.utils.json_to_sheet(
  //       allSensorsSheetData,
  //       { skipHeader: true }
  //     );
  //     XLSX.utils.book_append_sheet(
  //       workbook,
  //       allSensorsWorksheet,
  //       "All Sensors"
  //     );
  //   } else {
  //     alert("No data found in the selected date range.");
  //     return;
  //   }

  //   // Write workbook to an Excel file
  //   XLSX.writeFile(workbook, `SensorData-${Date.now()}.xlsx`);
  // };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f4f6f8" }}>
      <Grid container spacing={3} mb={3}>
        {[
          { label: "TDS Sensor", data: tdsData, icon: <WaterIcon /> },
          {
            label: "Temperature",
            data: temperatureData,
            icon: <ThermostatIcon />,
          },
          { label: "Humidity", data: humidityData, icon: <OpacityIcon /> },
          { label: "pH Level", data: phData, icon: <ScienceIcon /> },
        ].map((sensor, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                p: 3,
                minWidth: 200,
                cursor: "pointer",
                boxShadow: 2,
                borderRadius: 2,
                transition: "0.3s",
                "&:hover": { boxShadow: 5 },
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                {sensor.icon}
                <Stack justifyContent="center">
                  <Typography color="textSecondary" variant="subtitle1">
                    {sensor.label}
                  </Typography>
                  <Typography fontSize="1.8rem" fontWeight="bold">
                    {sensor.data.length > 0
                      ? `${sensor.data[sensor.data.length - 1]} units`
                      : "N/A"}
                  </Typography>
                </Stack>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ p: 1, boxShadow: 2, borderRadius: 2 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ xs: "flex-start", sm: "center" }}
            >
              <TextField
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <Button
                sx={{ mt: { xs: 2, sm: 0 } }}
                variant="contained"
                color="primary"
                // onClick={handleDownload}
              >
                Download
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} mt={3}>
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
      </Grid>
    </Box>
  );
};

export default DashboardView;
