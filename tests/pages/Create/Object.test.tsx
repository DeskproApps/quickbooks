import { lightTheme, ThemeProvider } from "@deskpro/deskpro-ui";
import { fireEvent, render, waitFor } from "@testing-library/react/";
import * as Api from "../../../src/api/api";
import React from "react";
import { CreateObject } from "../../../src/pages/Create/Object";

const renderPage = () => {
  return render(
    <ThemeProvider theme={lightTheme}>
      <CreateObject />
    </ThemeProvider>
  );
};

jest.mock("../../../src/api/api", () => {
  return {
    createCustomer: jest.fn(),
  };
});

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    objectName: "Customer",
  }),
  useNavigate: () => jest.fn(),
}));

describe("Create Object", () => {
  test("Creating an object should work correctly", async () => {
    const { getByTestId } = renderPage();

    fireEvent.change(getByTestId("input-GivenName"), {
      target: { value: "Name" },
    });

    fireEvent.click(getByTestId("button-submit"));

    await waitFor(() => {
      expect(Api.createCustomer).toHaveBeenCalled();
    });
  });
});
