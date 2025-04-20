import { Box, Button, Stack, Typography } from "@mui/material";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { Card } from "@mui/material";
import { useEffect, useState } from "react";
import { IUserModel } from "../../models/userModel";
import { convertTime } from "../../utilities/convertTime";
import { useNavigate } from "react-router-dom";

const ProfileView = () => {
  const [detailProfile, setDetailProfile] = useState<IUserModel>();
  const navigation = useNavigate();

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
          <Button
            variant="outlined"
            onClick={() =>
              navigation("/my-profile/edit/" + detailProfile?.userId)
            }
          >
            Edit
          </Button>
        </Stack>
        <table>
          <thead>
            <th></th>
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
                <Typography>{detailProfile?.userName}</Typography>
              </td>
            </tr>
            <tr>
              <td>
                <Typography fontWeight={"Bold"}>Role</Typography>
              </td>
              <td>:</td>
              <td>
                <Typography>{detailProfile?.userRole}</Typography>
              </td>
            </tr>
            <tr>
              <td>
                <Typography fontWeight={"Bold"}>Dibuat Pada</Typography>
              </td>
              <td>:</td>
              <td>
                <Typography>
                  {convertTime(detailProfile?.createdAt + "")}
                </Typography>
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </Box>
  );
};

export default ProfileView;
