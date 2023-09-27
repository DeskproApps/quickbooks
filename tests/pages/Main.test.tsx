import { lightTheme, ThemeProvider } from "@deskpro/deskpro-ui";
import { cleanup, render, waitFor } from "@testing-library/react/";
import React from "react";
import { Main } from "../../src/pages/Main";

const renderPage = () => {
  return render(
    <ThemeProvider theme={lightTheme}>
      <Main />
    </ThemeProvider>
  );
};

jest.mock("../../src/api/api", () => {
  return {
    getCustomerById: () => ({
      QueryResponse: {
        Customer: [
          {
            Taxable: false,
            BillAddr: {
              Id: "13",
              Line1: "David's house",
              City: "Wimbledon",
              Country: "UK",
            },
            ShipAddr: {
              Id: "14",
              Line1: "Line1",
              Line2: "House Number",
              City: "Porto",
              Country: "Portugal",
              PostalCode: "1234-123",
            },
            Job: false,
            BillWithParent: false,
            Balance: 3751,
            BalanceWithJobs: 3751,
            CurrencyRef: {
              value: "EUR",
              name: "Euro",
            },
            PreferredDeliveryMethod: "None",
            domain: "QBO",
            sparse: false,
            Id: "1",
            SyncToken: "4",
            MetaData: {
              CreateTime: "2023-09-11T09:05:03-07:00",
              LastUpdatedTime: "2023-09-21T08:42:49-07:00",
            },
            GivenName: "David",
            FamilyName: "Family",
            FullyQualifiedName: "David",
            CompanyName: "Deskpro",
            DisplayName: "David",
            PrintOnCheckName: "David",
            Active: true,
            PrimaryPhone: {
              FreeFormNumber: "351934575689",
            },
            Mobile: {
              FreeFormNumber: "+351934575689",
            },
            PrimaryEmailAddr: {
              Address: "example@gmail.com",
            },
          },
        ],
        startPosition: 1,
        maxResults: 1,
      },
      time: "2023-09-25T01:48:52.758-07:00",
    }),
    getInvoicesByCustomerId: () => ({
      QueryResponse: {
        Invoice: [
          {
            AllowIPNPayment: false,
            AllowOnlinePayment: false,
            AllowOnlineCreditCardPayment: false,
            AllowOnlineACHPayment: false,
            domain: "QBO",
            sparse: false,
            Id: "2",
            SyncToken: "0",
            MetaData: {
              CreateTime: "2023-09-18T04:12:06-07:00",
              LastUpdatedTime: "2023-09-18T04:12:06-07:00",
            },
            CustomField: [],
            DocNumber: "1002",
            TxnDate: "2023-09-18",
            CurrencyRef: {
              value: "EUR",
              name: "Euro",
            },
            PrivateNote: "this is a message on statement",
            LinkedTxn: [],
            Line: [
              {
                Id: "1",
                LineNum: 1,
                Description: "This is something that was done",
                Amount: 60,
                DetailType: "SalesItemLineDetail",
                SalesItemLineDetail: {
                  ItemRef: {
                    value: "1",
                    name: "Services",
                  },
                  UnitPrice: 30,
                  Qty: 2,
                },
              },
              {
                Amount: 60,
                DetailType: "SubTotalLineDetail",
                SubTotalLineDetail: {},
              },
            ],
            CustomerRef: {
              value: "1",
              name: "David Anjonrin",
            },
            CustomerMemo: {
              value: "this is a message on invoice",
            },
            BillAddr: {
              Id: "2",
              Line1: "Line1",
              Line2: "House Number",
              City: "Porto",
              Country: "Portugal",
              PostalCode: "1234-123",
            },
            ShipAddr: {
              Id: "14",
              Line1: "Line1",
              Line2: "House Number",
              City: "Porto",
              Country: "Portugal",
              PostalCode: "1234-123",
            },
            SalesTermRef: {
              value: "3",
            },
            DueDate: "2023-10-18",
            GlobalTaxCalculation: "NotApplicable",
            TotalAmt: 60,
            PrintStatus: "NotSet",
            EmailStatus: "NotSet",
            BillEmail: {
              Address: "email@gmail.com",
            },
            Balance: 60,
          },
        ],
      },
      time: "2023-09-25T01:48:53.998-07:00",
    }),
  };
});

describe("Main", () => {
  test("Main page should show all data correctly", async () => {
    const { getByText } = renderPage();

    const company = await waitFor(() => getByText(/Deskpro/i));

    const balance = await waitFor(() => getByText(/3751 EUR/i));

    const invoiceStatus = await waitFor(() => getByText(/Not Sent/i));

    await waitFor(() => {
      [company, balance, invoiceStatus].forEach((el) => {
        expect(el).toBeInTheDocument();
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();

    cleanup();
  });
});
