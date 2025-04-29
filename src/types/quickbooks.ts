export interface QuickBooksCompany {
    CompanyInfo: {
        CompanyName: string
        LegalName: string
    },
    time: string
}

// API Related

export interface QuickBooksErrorObject {
    message?: string
    Message?: string
    detail?: string
    Detail?: string
    code: string
    element?: unknown
    statusCode?: number
}
export interface QuickBooksFault {
    error?: Pick<QuickBooksErrorObject, "message" | "code" | "detail" | "element" | "statusCode">[]
    Error?: Pick<QuickBooksErrorObject, "Message" | "Detail" | "code">[]
    type: "AuthorizationFault" | "AUTHENTICATION" 
}

export interface QuickBooksFaultError {
    Fault?: QuickBooksFault
    fault?: QuickBooksFault
}

// Customer Related

export interface QuickBooksCustomer {
    Taxable: boolean;
    BillAddr: {
      Id: string;
      Line1: string;
      City: string;
      CountrySubDivisionCode: string;
      PostalCode: string;
      Lat: string;
      Long: string;
    };
    Job: boolean;
    BillWithParent: boolean;
    Balance: number;
    BalanceWithJobs: number;
    CurrencyRef: {
      value: string;
      name: string;
    };
    PreferredDeliveryMethod: string;
    IsProject: boolean;
    ClientEntityId: string;
    domain: string;
    sparse: boolean;
    Id: string;
    SyncToken: string;
    MetaData: {
      CreateTime: string;
      LastUpdatedTime: string;
    };
    GivenName: string;
    FamilyName: string;
    FullyQualifiedName: string;
    CompanyName: string;
    DisplayName: string;
    PrintOnCheckName: string;
    Active: boolean;
    V4IDPseudonym: string;
    PrimaryPhone: {
      FreeFormNumber: string;
    };
    PrimaryEmailAddr: {
      Address: string;
    };
  }