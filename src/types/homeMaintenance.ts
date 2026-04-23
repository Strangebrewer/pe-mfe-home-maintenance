export type Vehicle = {
  id: string;
  year: number;
  make: string;
  model: string;
  mileage: number;
  color?: string;
  trim?: string;
  plate?: string;
  vin?: string;
  insuranceId?: string;
};

export type Home = {
  id: string;
  address: string;
  isPrimary: boolean;
  yearBuilt?: number;
  sqFootage?: number;
  notes?: string;
  customData?: string;
};

export type HomeTask = {
  id: string;
  homeId: string;
  name: string;
  frequency: HomeTaskFrequency;
  description?: string;
  lastCompletionDate?: string;
};

export type HomeCompletion = {
  id: string;
  homeId: string;
  taskId: string;
  date: string;
  cost?: number;
  notes?: string;
};

export type ServiceRecord = {
  id: string;
  vehicleId: string;
  type: ServiceRecordType;
  date: string;
  mileage: number;
  cost?: number;
  name?: string;
  description?: string;
};

export enum HomeTaskFrequency {
  MONTHLY = 'monthly',
  SEASONAL = 'seasonal',
  BI_ANNUAL = 'bi_annual',
  ANNUAL = 'annual',
  AS_NEEDED = 'as_needed',
}

export enum ServiceRecordType {
  OIL_CHANGE = 'oil_change',
  TIRE_ROTATION = 'tire_rotation',
  SERVICE_ITEM = 'service_item',
}
