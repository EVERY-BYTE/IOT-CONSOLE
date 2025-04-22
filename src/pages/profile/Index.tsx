import { Box, Stack, Typography } from "@mui/material";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { Card } from "@mui/material";
import { firebaseAuth } from "../../firebase/auth";

const ProfileView = () => {
  const currentUser = firebaseAuth.getCurrentUser();

  return (
    <Box>
      <BreadCrumberStyle
        navigation={[
          {
            label: "Profile",
            link: "/profile",
            icon: <IconMenus.profile fontSize="small" />,
          },
        ]}
      />

      <Card sx={{ p: 3 }}>
        <Stack
          direction={"row"}
          alignItems={"center"}
          justifyContent={"space-between"}
        >
          <h1>My Profile</h1>
          {/* <Button
            variant="outlined"
            onClick={() => navigation("/my-profile/edit/" + currentUser?.uid)}
          >
            Edit
          </Button> */}
        </Stack>
        <table>
          <thead>
            <th></th>
            <th></th>
          </thead>
          <tbody>
            <tr>
              <td>
                <Typography fontWeight={"Bold"}>User Name</Typography>
              </td>
              <td>:</td>
              <td>
                <Typography>{currentUser?.displayName ?? "_"}</Typography>
              </td>
            </tr>
            <tr>
              <td>
                <Typography fontWeight={"Bold"}>E-mail</Typography>
              </td>
              <td>:</td>
              <td>
                <Typography>{currentUser?.email ?? "_"}</Typography>
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </Box>
  );
};

export default ProfileView;
