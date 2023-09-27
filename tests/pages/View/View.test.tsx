import { lightTheme, ThemeProvider } from "@deskpro/deskpro-ui";
import { cleanup, render, waitFor } from "@testing-library/react/";
import React from "react";
import { ViewObject } from "../../../src/pages/View/Object";

const renderPage = () => {
  return render(
    <ThemeProvider theme={lightTheme}>
      <ViewObject />
    </ThemeProvider>
  );
};

jest.mock("../../../src/hooks/useQueryWithClient.ts", () => ({
  ...jest.requireActual("../../../src/hooks/useQueryWithClient.ts"),
  useQueryMutationWithClient: () => {
    return {
      mutate: () => {},
      isSuccess: false,
      isLoading: false,
      isIdle: true,
      data: {
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
      },
    };
  },
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    objectName: "Customer",
    objectId: "1",
    objectView: "single",
  }),
  useNavigate: () => jest.fn(),
}));

describe("View", () => {
  test("View page should show a customer correctly", async () => {
    const { getByText } = renderPage();

    const companyName = await waitFor(() => getByText(/Deskpro/i));

    const balance = await waitFor(() => getByText(/3751 EUR/i));

    await waitFor(() => {
      [companyName, balance].forEach((el) => {
        expect(el).toBeInTheDocument();
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();

    cleanup();
  });
});
