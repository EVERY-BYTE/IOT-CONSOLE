/* eslint-disable @typescript-eslint/no-explicit-any */
import Box from '@mui/material/Box'
import DeleteIcon from '@mui/icons-material/DeleteOutlined'
import {
  GridRowsProp,
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridToolbarContainer,
  GridToolbarExport
} from '@mui/x-data-grid'
import { useEffect, useState } from 'react'
import { useHttp } from '../../hooks/http'
import { Button, Stack, TextField } from '@mui/material'
import BreadCrumberStyle from '../../components/breadcrumb/Index'
import { IconMenus } from '../../components/icon'
import Modal from '../../components/modal'
import { convertTime } from '../../utilities/convertTime'
import { IUserModel } from '../../models/userModel'

export default function ListHistoryView() {
  const [tableData, setTableData] = useState<GridRowsProp[]>([])
  const { handleGetTableDataRequest, handleRemoveRequest } = useHttp()
  const [modalDeleteData, setModalDeleteData] = useState<IUserModel>()
  const [openModalDelete, setOpenModalDelete] = useState<boolean>(false)

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 25,
    page: 0
  })

  const handleDeleteUser = async (userId: string) => {
    await handleRemoveRequest({
      path: '/gps-locations?userId=' + userId
    })
    window.location.reload()
  }

  const handleOpenModalDelete = (data: IUserModel) => {
    setModalDeleteData(data)
    setOpenModalDelete(!openModalDelete)
  }

  const getTableData = async ({ search }: { search: string }) => {
    try {
      const result = await handleGetTableDataRequest({
        path: '/gps-locations',
        page: paginationModel.page ?? 0,
        size: paginationModel.pageSize ?? 10,
        filter: { search }
      })
      if (result) {
        console.log(result)
        const mapResult = result.items.map((item: any) => {
          return { ...item, userName: item?.user?.userName }
        })
        setTableData(mapResult)
      }
    } catch (error: any) {
      console.log(error)
    }
  }

  useEffect(() => {
    getTableData({ search: '' })
  }, [paginationModel])

  const columns: GridColDef[] = [
    {
      field: 'userName',
      flex: 1,
      renderHeader: () => <strong>{'User Name'}</strong>,
      editable: true
    },

    {
      field: 'gpsLocationLatitude',
      flex: 1,
      renderHeader: () => <strong>{'Latitude'}</strong>,
      editable: true
    },
    {
      field: 'gpsLocationLongitude',
      flex: 1,
      renderHeader: () => <strong>{'Longitude'}</strong>,
      editable: true
    },
    {
      field: 'updateAt',
      flex: 1,
      renderHeader: () => <strong>{'Terakhir Update'}</strong>,
      editable: true,
      valueFormatter: (item) => convertTime(item.value)
    },
    {
      field: 'actions',
      type: 'actions',
      renderHeader: () => <strong>{'ACTION'}</strong>,
      flex: 1,
      cellClassName: 'actions',
      getActions: ({ row }) => {
        return [
          <GridActionsCellItem
            icon={<DeleteIcon color='error' />}
            label='Delete'
            onClick={() => handleOpenModalDelete(row)}
            color='inherit'
          />
        ]
      }
    }
  ]

  function CustomToolbar() {
    const [search, setSearch] = useState<string>('')
    return (
      <GridToolbarContainer sx={{ justifyContent: 'space-between', mb: 2 }}>
        <Stack direction='row' spacing={2}>
          <GridToolbarExport />
        </Stack>
        <Stack direction={'row'} spacing={1} alignItems={'center'}>
          <TextField
            size='small'
            placeholder='search...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant='outlined' onClick={() => getTableData({ search })}>
            Search
          </Button>
        </Stack>
      </GridToolbarContainer>
    )
  }

  return (
    <>
      <BreadCrumberStyle
        navigation={[
          {
            label: 'History',
            link: '/history',
            icon: <IconMenus.history fontSize='small' />
          }
        ]}
      />
      <Box
        sx={{
          width: '100%',
          '& .actions': {
            color: 'text.secondary'
          },
          '& .textPrimary': {
            color: 'text.primary'
          }
        }}
      >
        <DataGrid
          rows={tableData}
          columns={columns}
          editMode='row'
          sx={{ padding: 2 }}
          initialState={{
            pagination: { paginationModel: { pageSize: 2, page: 0 } }
          }}
          pageSizeOptions={[2, 5, 10, 25]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          slots={{
            toolbar: CustomToolbar
          }}
        />
      </Box>

      <Modal
        openModal={openModalDelete}
        handleModalOnCancel={() => setOpenModalDelete(false)}
        message={'Apakah anda yakin ingin menghapus user ' + modalDeleteData?.userName}
        handleModal={() => {
          handleDeleteUser(modalDeleteData?.userId ?? '')
          setOpenModalDelete(!openModalDelete)
        }}
      />
    </>
  )
}
