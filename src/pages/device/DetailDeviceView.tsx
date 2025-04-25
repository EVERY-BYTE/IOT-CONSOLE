/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Grid, Card, Typography, Button, Stack } from "@mui/material";
import ReactApexChart from "react-apexcharts";
import * as XLSX from "xlsx";
import { IDeviceModel } from "../../models/deviceModel";
import { firebaseDb } from "../../firebase/db";
import { ApexOptions } from "apexcharts";

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

export default function DetailDeviceView() {
  const { email, deviceId } = useParams();
  const [deviceData, setDeviceData] = useState<IDeviceModel | null>(null);
  const [chartSeries, setChartSeries] = useState<any[]>([]);

  const fetchDeviceData = async () => {
    try {
      if (!deviceId) return;

      const path = `${email}/deviceData/${deviceId}`;
      const result: any = await firebaseDb.read(path);
      const data = Object.values(result)[0] as IDeviceModel;

      console.log(
        data.deviceValue.map((entry: any) => ({
          x: new Date(entry.timeStamp),
          y: entry.value,
        }))
      );

      if (data) {
        setDeviceData(data);
        setChartSeries([
          {
            name: data.deviceType,
            data: data.deviceValue.map((entry: any) => ({
              x: new Date(entry.timeStamp),
              y: entry.value,
            })),
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching device data:", error);
    }
  };

  useEffect(() => {
    fetchDeviceData();
  }, [deviceId]);

  const handleExport = () => {
    if (!deviceData) return;

    const worksheet = XLSX.utils.json_to_sheet(
      deviceData.deviceValue.map((entry: any) => ({
        timestamp: new Date(entry.timeStamp).toISOString(),
        value: entry.value,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sensor Data");
    XLSX.writeFile(workbook, `${deviceData?.deviceName}_data.xlsx`);
  };

  if (!deviceData) return <div>Loading...</div>;

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Typography variant="h4">{deviceData.deviceName}</Typography>
        <Button variant="contained" onClick={handleExport}>
          Export to Excel
        </Button>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Device Info
            </Typography>
            <Typography>ID: {deviceData.deviceId}</Typography>
            <Typography>Type: {deviceData.deviceType}</Typography>
            <Typography>Owner: {deviceData.deviceUserName}</Typography>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {deviceData.deviceName} Chart
            </Typography>
            <ReactApexChart
              options={{
                ...chartOptions,
                colors: [getChartColor(deviceData.deviceType)],
                title: { text: deviceData.deviceName },
              }}
              series={chartSeries}
              type="area"
              height={250}
            />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

function getChartColor(sensorType: string): string {
  const colors: { [key: string]: string } = {
    TDS: "#00bcd4",
    TEMPERATURE: "#ff5722",
    HUMADITY: "#4caf50",
    PH: "#8e44ad",
  };
  return colors[sensorType] || "#000";
}
