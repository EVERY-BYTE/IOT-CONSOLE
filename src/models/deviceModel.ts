export interface IDeviceModel {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceUserName: string;
  deviceType: "TDS" | "TEMPERATURE" | "HUMADITY" | "PH";
  deviceData: IDeviceData[];
}

interface IDeviceData {
  value: number;
  timeStamp: string;
}

export interface IDeviceCreateModel {
  deviceId: string;
  deviceName: string;
  deviceUserName: string;
  deviceType: "TDS" | "TEMPERATURE" | "HUMADITY" | "PH" | string;
}

export interface IDeviceEditModel {
  deviceId: string;
  deviceName?: string;
  deviceUserName?: string;
  deviceType?: "TDS" | "TEMPERATURE" | "HUMADITY" | "PH" | string;
}
