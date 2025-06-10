/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Box, Grid, Card, Typography, Button, Stack } from "@mui/material";
import ReactApexChart from "react-apexcharts";
import * as XLSX from "xlsx";
import { firebaseDb } from "../../firebase/db";
import { ApexOptions } from "apexcharts";
import { IDeviceModel } from "../../models/deviceModel";
import { useParams } from "react-router-dom";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

const chartOptions: ApexOptions = {
  chart: {
    type: "area",
    height: 350,
    zoom: { enabled: false },
  },
  xaxis: {
    type: "datetime",
  },
  dataLabels: {
    enabled: false,
  },
  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.9,
      stops: [0, 100],
    },
  },
  tooltip: {
    x: { format: "dd/MM/yy HH:mm" },
  },
};

// Modular function to adjust timestamp to WIB (UTC+7)
const adjustToWIB = (timestamp: number): Date => {
  const WIB_OFFSET = 7 * 60 * 60 * 1000; // 7 hours in milliseconds
  return new Date(timestamp * 1000 + WIB_OFFSET);
};

// New modular function to filter data by date range
const filterDataByDateRange = (
  data: any[],
  startDate: Date | null,
  endDate: Date | null
): any[] => {
  if (!startDate || !endDate) return data; // Return all data if either date is null
  return data.filter((entry) => entry.x >= startDate && entry.x <= endDate);
};

export default function DetailSensorView() {
  const { email, sensorId } = useParams();
  const [chartSeries, setChartSeries] = useState<any[]>([]);
  const [deviceName, setDeviceName] = useState("Sensor");
  const [deviceType, setDeviceType] = useState("GENERIC");
  const [deviceValue, setDeviceValue] = useState<any[]>([]);
  const [allData, setAllData] = useState<any[]>([]); // Store unfiltered data
  const [startDate, setStartDate] = useState<Date | null>(null); // Default to null for all data
  const [endDate, setEndDate] = useState<Date | null>(null); // Default to null for all data

  const fetchDeviceData = async () => {
    try {
      if (!sensorId) return;

      const path = `${email}/deviceData/${sensorId}`;
      const result: any = await firebaseDb.read(path);

      const sensorPath = `${email}/devices`;
      const sensors = (await firebaseDb.read(sensorPath)) as IDeviceModel[];

      if (sensors) {
        const sensorDetil = Object.values(sensors).find(
          (device: IDeviceModel) => device.deviceId === sensorId
        );

        if (sensorDetil) {
          setDeviceName(sensorDetil?.deviceName);
          setDeviceType(sensorDetil?.deviceType);
        }
      }

      if (!result) {
        setChartSeries([]);
        setDeviceValue([]);
        setAllData([]);
        return;
      }

      const entries = Object.values(result) as any[];
      const formattedData = entries
        .filter((entry: any) => entry.timestamp && !isNaN(entry.timestamp))
        .map((entry: any) => ({
          x: adjustToWIB(entry.timestamp),
          y: entry.value,
        }))
        .filter((data) => !isNaN(data.x.getTime())); // Ensure valid Date objects

      setAllData(formattedData); // Store unfiltered data
      const filteredData = filterDataByDateRange(
        formattedData,
        startDate,
        endDate
      ); // Apply date range filter
      setDeviceValue(filteredData);
      setChartSeries([
        {
          name: "Sensor Value",
          data: filteredData,
          group: "apexcharts-axis-0",
        },
      ]);
    } catch (error) {
      console.error("Error fetching device data:", error);
      setChartSeries([]);
      setDeviceValue([]);
      setAllData([]);
    }
  };

  useEffect(() => {
    fetchDeviceData();
  }, [sensorId]);

  useEffect(() => {
    // Reapply filter when startDate or endDate changes
    const filteredData = filterDataByDateRange(allData, startDate, endDate);
    setDeviceValue(filteredData);
    setChartSeries([
      {
        name: "Sensor Value",
        data: filteredData,
        group: "apexcharts-axis-0",
      },
    ]);
  }, [startDate, endDate, allData]);

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      deviceValue.map((entry: any) => ({
        timestamp: entry.x.toISOString(),
        value: entry.y,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sensor Data");
    XLSX.writeFile(workbook, `${deviceName}_data.xlsx`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Typography variant="h4">{deviceName}</Typography>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Sensor Info
            </Typography>
            <Typography>sensor id: {sensorId}</Typography>
            <Typography>name: {deviceName}</Typography>
            <Typography>type: {deviceType}</Typography>
            <Typography>user name: {email}</Typography>
          </Card>
        </Grid>

        <Stack direction="row" spacing={2} mt={5} p={3}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Start Date"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              slotProps={{ textField: { size: "small" } }}
            />
            <DateTimePicker
              label="End Date"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              slotProps={{ textField: { size: "small" } }}
            />
          </LocalizationProvider>
          <Button variant="contained" onClick={handleExport}>
            Export to Excel
          </Button>
        </Stack>

        <Grid item xs={12}>
          {chartSeries.length && chartSeries[0].data.length > 1 ? (
            <Card sx={{ p: 3 }}>
              {/* <Typography variant="h6" gutterBottom>
                {deviceName} Chart
              </Typography> */}
              <ReactApexChart
                options={{
                  ...chartOptions,
                  colors: ["#8e44ad"],
                  title: { text: deviceName },
                }}
                series={chartSeries}
                type="area"
                height={250}
              />
            </Card>
          ) : (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              height={250}
              color="text.secondary"
            >
              <Typography variant="h4" align="center">
                Tidak ada data yang tersedia
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
