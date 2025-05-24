/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Grid, Card, Typography, Button, Stack } from "@mui/material";
import ReactApexChart from "react-apexcharts";
import * as XLSX from "xlsx";
import { firebaseDb } from "../../firebase/db";
import { ApexOptions } from "apexcharts";
import { IDeviceModel } from "../../models/deviceModel";

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

export default function DetailSensorView() {
  const { email, sensorId } = useParams();
  const [chartSeries, setChartSeries] = useState<any[]>([]);
  const [deviceName, setDeviceName] = useState("Sensor");
  const [deviceType, setDeviceType] = useState("GENERIC");
  const [deviceValue, setDeviceValue] = useState<any[]>([]);

  const fetchDeviceData = async () => {
    try {
      if (!sensorId) return;

      const path = `${email}/deviceData/${sensorId}`;
      const result: any = await firebaseDb.read(path);

      console.log("===senosrs detail");
      console.log(result);

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

      const entries = Object.values(result) as any[];
      const formattedData = entries.map((entry: any) => ({
        x: new Date(entry.timestamp * 1000),
        y: entry.value,
      }));

      setDeviceValue(formattedData);
      setChartSeries([
        {
          name: "Sensor Value",
          data: formattedData,
        },
      ]);
    } catch (error) {
      console.error("Error fetching device data:", error);
    }
  };

  console.log("====chart series");
  console.log(chartSeries);
  useEffect(() => {
    fetchDeviceData();
  }, [sensorId]);

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

  if (!deviceValue.length) return <div>Loading...</div>;

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Typography variant="h4">{deviceName}</Typography>
        <Button variant="contained" onClick={handleExport}>
          Export to Excel
        </Button>
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

        <Grid item xs={12}>
          {chartSeries.length && chartSeries[0].data.length > 1 ? (
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {deviceName} Chart
              </Typography>
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
