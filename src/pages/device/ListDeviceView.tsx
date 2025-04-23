/* eslint-disable @typescript-eslint/no-explicit-any */
import Box from "@mui/material/Box";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import {
  GridRowsProp,
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";
import { Add, MoreOutlined } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { Button, Stack, TextField } from "@mui/material";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/modal";
import { firebaseDb } from "../../firebase/db";
import { firebaseAuth } from "../../firebase/auth";
import { removeDotsFromEmail } from "../../utilities/removeDotsFromEmail";
import { IDeviceModel } from "../../models/deviceModel";

export default function ListDeviceView() {
  const navigation = useNavigate();
  const [tableData, setTableData] = useState<GridRowsProp[]>([]);
  const [modalDeleteData, setModalDeleteData] = useState<IDeviceModel>();
  const [openModalDelete, setOpenModalDelete] = useState<boolean>(false);

  const currentUser = firebaseAuth.getCurrentUser();
  const email = removeDotsFromEmail(currentUser?.email ?? "");

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 25,
    page: 0,
  });

  const handleDeleteDevice = async (deviceId: string) => {
    try {
      await firebaseDb.delete(`${email}/devices/${deviceId}`);
      getTableData({ search: "" });
      setOpenModalDelete(false);
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleOpenModalDelete = (data: IDeviceModel) => {
    setModalDeleteData(data);
    setOpenModalDelete(!openModalDelete);
  };

  const getTableData = async ({ search }: { search: string }) => {
    try {
      const data = await firebaseDb.readAll(`${email}/devices`);

      const formattedData = Object.entries(data).map(
        ([deviceId, deviceData]) => ({
          id: deviceId,
          deviceId: deviceId,
          ...(deviceData as object),
        })
      ) as IDeviceModel[];

      const filteredData = formattedData.filter((device) => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return (
          device.deviceName?.toLowerCase().includes(searchLower) ||
          device.deviceType?.toLowerCase().includes(searchLower)
        );
      }) as GridRowsProp[] | any;

      console.log(filteredData);

      setTableData(filteredData);
    } catch (error: unknown) {
      console.log(error);
    }
  };

  useEffect(() => {
    getTableData({ search: "" });
  }, [paginationModel]);

  const columns: GridColDef[] = [
    {
      field: "deviceName",
      flex: 1,
      renderHeader: () => <strong>{"Name"}</strong>,
      editable: true,
    },
    {
      field: "deviceType",
      flex: 1,
      renderHeader: () => <strong>{"Type"}</strong>,
      editable: true,
    },
    {
      field: "actions",
      type: "actions",
      renderHeader: () => <strong>{"ACTION"}</strong>,
      flex: 1,
      cellClassName: "actions",
      getActions: ({ row }) => {
        return [
          <GridActionsCellItem
            icon={<DeleteIcon color="error" />}
            label="Delete"
            onClick={() => handleOpenModalDelete(row)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<MoreOutlined color="info" />}
            label="Detail"
            className="textPrimary"
            onClick={() => navigation(`detail/${email}/${row.deviceId}`)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  function CustomToolbar() {
    const [search, setSearch] = useState<string>("");
    return (
      <GridToolbarContainer sx={{ justifyContent: "space-between", mb: 2 }}>
        <Stack direction="row" spacing={2}>
          <GridToolbarExport />
          <Button
            startIcon={<Add />}
            variant="outlined"
            onClick={() => navigation("create")}
          >
            Create
          </Button>
        </Stack>
        <Stack direction={"row"} spacing={1} alignItems={"center"}>
          <TextField
            size="small"
            placeholder="search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                getTableData({ search });
              }
            }}
          />
          <Button variant="outlined" onClick={() => getTableData({ search })}>
            Search
          </Button>
        </Stack>
      </GridToolbarContainer>
    );
  }

  return (
    <>
      <BreadCrumberStyle
        navigation={[
          {
            label: "Device",
            link: "/devices",
            icon: <IconMenus.device fontSize="small" />,
          },
        ]}
      />
      <Box
        sx={{
          width: "100%",
          "& .actions": {
            color: "text.secondary",
          },
          "& .textPrimary": {
            color: "text.primary",
          },
        }}
      >
        <DataGrid
          rows={tableData}
          columns={columns}
          editMode="row"
          sx={{ padding: 2 }}
          initialState={{
            pagination: { paginationModel: { pageSize: 2, page: 0 } },
          }}
          pageSizeOptions={[2, 5, 10, 25]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          slots={{
            toolbar: CustomToolbar,
          }}
          showToolbar
        />
      </Box>

      <Modal
        openModal={openModalDelete}
        handleModalOnCancel={() => setOpenModalDelete(false)}
        message={
          "Are you sure you want to delete device " +
          modalDeleteData?.deviceName +
          "?"
        }
        handleModal={() => {
          handleDeleteDevice(modalDeleteData?.id ?? "");
          setOpenModalDelete(!openModalDelete);
        }}
      />
    </>
  );
}
