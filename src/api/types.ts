import { IBill } from "../types/bill";
import { ICustomer } from "../types/customer";
import { IInvoice } from "../types/invoice";
import { IPurchaseOrder } from "../types/purchaseorder";

export type RequestMethod = "GET" | "POST" | "PATCH" | "DELETE";

type ResponseKey = "Invoice" | "Bill" | "Customer" | "PurchaseOrder" | "Item";

export interface IQueryResponse<T, K extends ResponseKey> {
  QueryResponse: {
    [key in K]: T[];
  };
}

export type IQueryResponseAll =
  | IQueryResponse<IInvoice, "Invoice">
  | IQueryResponse<IBill, "Bill">
  | IQueryResponse<ICustomer, "Customer">
  | IQueryResponse<IPurchaseOrder, "PurchaseOrder">;
