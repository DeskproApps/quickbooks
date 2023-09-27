export interface ICustomer {
  PrimaryEmailAddr: PrimaryEmailAddr;
  SyncToken: string;
  domain: string;
  GivenName: string;
  DisplayName: string;
  BillWithParent: boolean;
  FullyQualifiedName: string;
  CompanyName: string;
  FamilyName: string;
  sparse: boolean;
  PrimaryPhone: PrimaryPhone;
  Active: boolean;
  Job: boolean;
  BalanceWithJobs: number;
  BillAddr: BillAddr;
  PreferredDeliveryMethod: string;
  Taxable: boolean;
  PrintOnCheckName: string;
  Balance: number;
  Id: string;
  MetaData: MetaData;
}

export interface BillAddr {
  City: string;
  Line1: string;
  PostalCode: string;
  Lat: string;
  Long: string;
  CountrySubDivisionCode: string;
  Id: string;
}

export interface MetaData {
  CreateTime: string;
  LastUpdatedTime: string;
}

export interface PrimaryEmailAddr {
  Address: string;
}

export interface PrimaryPhone {
  FreeFormNumber: string;
}
