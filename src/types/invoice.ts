export interface IInvoice {
  TxnDate: string;
  domain: string;
  PrintStatus: string;
  SalesTermRef: CustomerMemo;
  TotalAmt: number;
  Line: Line[];
  DueDate: string;
  ApplyTaxAfterDiscount: boolean;
  DocNumber: string;
  sparse: boolean;
  CustomerMemo: CustomerMemo;
  Deposit: number;
  Balance: number;
  CustomerRef: Ref;
  TxnTaxDetail: TxnTaxDetail;
  SyncToken: string;
  LinkedTxn: { [key: string]: string }[];
  BillEmail: BillEmail;
  ShipAddr: ShipAddr;
  EmailStatus: string;
  BillAddr: BillAddr;
  MetaData: MetaData;
  CustomField: CustomField[];
  Id: string;
}

export interface BillAddr {
  Line4: string;
  Line3: string;
  Line2: string;
  Line1: string;
  Long: string;
  Lat: string;
  Id: string;
}

export interface BillEmail {
  Address: string;
}

export interface CustomField {
  DefinitionId: string;
  StringValue: string;
  Type: string;
  Name: string;
}

export interface CustomerMemo {
  value: string;
}

export interface Ref {
  name: string;
  value: string;
}

export interface Line {
  Description?: string;
  DetailType: string;
  SalesItemLineDetail?: SalesItemLineDetail;
  LineNum?: number;
  Amount: number;
  Id?: string;
}

export interface SalesItemLineDetail {
  TaxCodeRef: CustomerMemo;
  Qty: number;
  UnitPrice: number;
  ItemRef: Ref;
}

export interface MetaData {
  CreateTime: string;
  LastUpdatedTime: string;
}

export interface ShipAddr {
  City: string;
  Line1: string;
  PostalCode: string;
  Lat: string;
  Long: string;
  CountrySubDivisionCode: string;
  Id: string;
}

export interface TxnTaxDetail {
  TxnTaxCodeRef: CustomerMemo;
  TotalTax: number;
  TaxLine: TaxLine[];
}

export interface TaxLine {
  DetailType: string;
  Amount: number;
  TaxLineDetail: TaxLineDetail;
}

export interface TaxLineDetail {
  NetAmountTaxable: number;
  TaxPercent: number;
  TaxRateRef: CustomerMemo;
  PercentBased: boolean;
}
