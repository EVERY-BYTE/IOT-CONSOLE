import { useEffect, useState } from 'react'
import {
  Button,
  Card,
  Typography,
  Box,
  TextField,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { useHttp } from '../../hooks/http'
import { IUserModel, IUserUpdateRequestModel } from '../../models/userModel'

export default function EditUserView() {
  const { handleGetRequest, handleUpdateRequest } = useHttp()
  const navigate = useNavigate()
  const { userId } = useParams()

  const [user, setUser] = useState<IUserUpdateRequestModel>({
    userId: userId!,
    userName: '',
    userPassword: '',
    userRole: ''
  })

  const handleSubmit = async () => {
    try {
      await handleUpdateRequest({
        path: '/users',
        body: user
      })
      navigate('/users')
    } catch (error: unknown) {
      console.log(error)
    }
  }

  const getDetailUser = async () => {
    const result: IUserModel = await handleGetRequest({
      path: '/users/detail/' + userId
    })
    if (result) {
      setUser(result)
    }
  }

  useEffect(() => {
    getDetailUser()
  }, [])

  return (
    <>
      <Card
        sx={{
          mt: 5,
          p: 8
        }}
      >
        <Typography variant='h4' marginBottom={5} color='primary' fontWeight={'bold'}>
          Edit User
        </Typography>
        <Box
          component='form'
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <TextField
            label='E-mail'
            id='outlined-start-adornment'
            sx={{ m: 1 }}
            value={user?.userName}
            type='text'
            onChange={(e) => {
              setUser({
                ...user,
                userName: e.target.value
              })
            }}
          />
          <TextField
            label='Password'
            id='outlined-start-adornment'
            sx={{ m: 1 }}
            value={user?.userPassword}
            type='password'
            onChange={(e) => {
              setUser({
                ...user,
                userPassword: e.target.value
              })
            }}
          />
          <FormControl fullWidth>
            <InputLabel id='demo-multiple-name-label'>Pilih Role</InputLabel>
            <Select
              labelId='demo-select-small-label'
              id='demo-select-small'
              value={user?.userRole}
              fullWidth
              sx={{ m: 1 }}
              onChange={(e) => {
                setUser({
                  ...user,
                  userRole: e.target.value
                })
              }}
            >
              <MenuItem selected value={'user'}>
                User
              </MenuItem>
              <MenuItem value={'admin'}>Admin</MenuItem>
            </Select>
          </FormControl>

          <Stack direction={'row'} justifyContent='flex-end'>
            <Button
              sx={{
                m: 1,
                width: '25ch',
                backgroundColor: 'dodgerblue',
                color: '#FFF',
                fontWeight: 'bold'
              }}
              variant={'contained'}
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </Stack>
        </Box>
      </Card>
    </>
  )
}
