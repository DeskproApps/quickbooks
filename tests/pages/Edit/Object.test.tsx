import { lightTheme, ThemeProvider } from "@deskpro/deskpro-ui";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react/";
import * as Api from "../../../src/api/api";
import React from "react";
import { MutateObject } from "../../../src/components/Mutate/Object";

const renderPage = () => {
  return render(
    <ThemeProvider theme={lightTheme}>
      <MutateObject objectId="1" objectName="Customer" />
    </ThemeProvider>
  );
};

jest.mock("../../../src/api/api", () => {
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
    editCustomer: jest.fn(),
  };
});

describe("Edit Page", () => {
  test("Editing a Customer should work correctly", async () => {
    const { getByTestId } = renderPage();

    fireEvent.change(getByTestId("input-GivenName"), {
      target: { value: "Name" },
    });

    await waitFor(() => {
      fireEvent(getByTestId("button-submit"), new MouseEvent("click"));

      expect(Api.editCustomer).toBeCalled();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();

    cleanup();
  });
});
