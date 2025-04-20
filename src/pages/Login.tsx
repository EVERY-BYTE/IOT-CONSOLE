import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {
  Button,
  Card,
  Typography,
  Container,
  Box,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const LoginView = () => {
  const navigate = useNavigate();

  const [userEmail, setuserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");

  const handleSubmit = async () => {
    try {
      const auth = getAuth();
      try {
        await signInWithEmailAndPassword(auth, userEmail, userPassword);
        console.log("Login successful");
      } catch (error: any) {
        console.log(error);
      }

      navigate("/");
    } catch (error: unknown) {
      console.log(error);
    }
  };

  return (
    <>
      <Container maxWidth="xs">
        <Card
          sx={{
            mt: 5,
            p: 8,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h4"
            marginBottom={5}
            color="primary"
            fontWeight={"bold"}
          >
            Login
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
              label="E-mail"
              id="outlined-start-adornment"
              sx={{ m: 1, width: "36ch" }}
              value={userEmail}
              type="email"
              onChange={(e) => {
                setuserEmail(e.target.value);
              }}
            />

            <TextField
              label="Password"
              id="outlined-start-adornment"
              sx={{ m: 1, width: "36ch" }}
              value={userPassword}
              type="password"
              onChange={(e) => {
                setUserPassword(e.target.value);
              }}
            />
            <Button
              sx={{
                m: 1,
                backgroundColor: "dodgerblue",
                color: "#FFF",
                fontWeight: "bold",
              }}
              variant={"contained"}
              onClick={handleSubmit}
            >
              Login
            </Button>
          </Box>
        </Card>
      </Container>
    </>
  );
};

export default LoginView;
