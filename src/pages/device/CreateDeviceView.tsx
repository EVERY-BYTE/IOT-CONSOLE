import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { firebaseDb } from "../../firebase/db";
import { Button, Card, Typography, Box, TextField, Stack } from "@mui/material";

export default function CreateDeviceView() {
  const [device, setDevice] = useState({
    deviceName: "",
    deviceId: uuidv4(),
  });

  const handleSubmit = async () => {
    try {
      console.log("sdsdsd");
      await firebaseDb.create("devices", {
        deviceName: device.deviceName,
        deviceId: device.deviceId,
      });
      // window.history.back();
    } catch (error: unknown) {
      console.log(error);
    }
  };

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
          Tambah Device
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
            label="Device Name"
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
