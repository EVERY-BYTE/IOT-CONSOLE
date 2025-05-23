import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { firebaseDb } from "../../firebase/db";
import {
  Button,
  Card,
  Typography,
  Box,
  TextField,
  Stack,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { IDeviceCreateModel } from "../../models/deviceModel";
import { firebaseAuth } from "../../firebase/auth";
import { removeDotsFromEmail } from "../../utilities/removeDotsFromEmail";

export default function CreateSensorView() {
  const [device, setDevice] = useState({
    deviceName: "",
    deviceId: uuidv4(),
    deviceType: "",
  });

  const [currentUser, setCurrentUser] = useState({
    email: "",
    uid: "",
  });

  const createDevice = async () => {
    const dbPath = `${removeDotsFromEmail(currentUser.email)}/devices`;

    const payload: IDeviceCreateModel = {
      deviceName: device.deviceName,
      deviceId: device.deviceId,
      deviceUserName: currentUser.email,
      deviceType: device.deviceType,
    };

    await firebaseDb.create(dbPath, payload);
  };

  const createDeviceData = async () => {
    const dbPath = `${removeDotsFromEmail(currentUser.email)}/deviceData/${
      device.deviceId
    }`;

    const payload = {
      deviceName: device.deviceName,
      deviceId: device.deviceId,
      deviceUserName: currentUser.email,
      deviceType: device.deviceType,
      deviceValue: [
        {
          value: 0,
          timeStamp: Date.now(),
        },
      ],
    };

    await firebaseDb.create(dbPath, payload);
  };

  const handleSubmit = async () => {
    try {
      await createDevice();
      await createDeviceData();
      window.history.back();
    } catch (error: unknown) {
      console.log(error);
    }
  };

  const getCurrentUser = async () => {
    const user = await firebaseAuth.getCurrentUser();
    console.log(user);
    setCurrentUser({
      email: user?.email || "",
      uid: user?.uid || "",
    });
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  return (
    <>
      <Card
        sx={{
          mt: 5,
          p: 8,
        }}
      >
        <Typography
          variant="h4"
          marginBottom={5}
          color="primary"
          fontWeight={"bold"}
        >
          Add Sensor
        </Typography>
        <Box
          component="form"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <TextField
            label="Sensor Name"
            id="outlined-start-adornment"
            sx={{ m: 1 }}
            value={device.deviceName}
            type="text"
            onChange={(e) => {
              setDevice({
                ...device,
                deviceName: e.target.value,
              });
            }}
          />
          <FormControl sx={{ m: 1 }}>
            <InputLabel>Sensor Type</InputLabel>
            <Select
              value={device.deviceType}
              label="Sensor Type"
              onChange={(e) =>
                setDevice({
                  ...device,
                  deviceType: e.target
                    .value as IDeviceCreateModel["deviceType"],
                })
              }
            >
              <MenuItem value="LDR">LDR</MenuItem>
              <MenuItem value="SOIL_MOISTURE">SOIL_MOISTURE</MenuItem>
              <MenuItem value="DS18B20">DS18B20</MenuItem>
              <MenuItem value="DHT11_TEMPERATURE">DHT11_TEMPERATURE</MenuItem>
            </Select>
          </FormControl>
          <Stack direction={"row"} justifyContent="flex-end">
            <Button
              sx={{
                m: 1,
                width: "25ch",
                backgroundColor: "dodgerblue",
                color: "#FFF",
                fontWeight: "bold",
              }}
              variant={"contained"}
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </Stack>
        </Box>
      </Card>
    </>
  );
}
