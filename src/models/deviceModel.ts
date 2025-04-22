export interface IDeviceModel {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceUserName: string;
  deviceType: "TDS" | "TEMPERATURE" | "HUMADITY" | "PH";
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
