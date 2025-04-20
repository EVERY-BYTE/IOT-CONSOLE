import { IRootModel } from './rootModel'

export interface IGpsLocation extends IRootModel {
  gpsLocationId: string
  gpsLocationUserId: string
  gpsLocationName: string
  gpsLocationLatitude: string
  gpsLocationLongitude: string
  user: {
    userName: string
  }
}

export interface IGpsLocationCreateRequest {
  gpsLocationName: string
  gpsLocationLatitude: string
  gpsLocationLongitude: string
}

export interface IGpsLocationUpdateRequest {
  gpsLocationId: string
  gpsLocationName: string
  gpsLocationLatitude: string
  gpsLocationLongitude: string
}
