import {
  IDeskproClient,
  useDeskproAppEvents,
  useInitialisedDeskproAppClient,
} from "@deskpro/app-sdk";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCustomerById,
  getInvoiceById,
  getInvoicesByCustomerId,
} from "../../api/api";
import { FieldMapping } from "../../components/FieldMapping/FieldMapping";
import { LoadingSpinnerCenter } from "../../components/LoadingSpinnerCenter/LoadingSpinnerCenter";
import { useQueryMutationWithClient } from "../../hooks/useQueryWithClient";
import customerJson from "../../mapping/customer.json";
import invoiceJson from "../../mapping/invoice.json";

import { H2 } from "@deskpro/deskpro-ui";
import { IJson } from "../../types/json";
import { capitalizeFirstLetter } from "../../utils/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getTitle = (e: any, objectName: string) => {
  switch (objectName) {
    case "Invoice": {
      return e.DocNumber;
    }
    case "Customer": {
      return e.FullyQualifiedName;
    }
  }
};

export const ViewObject = () => {
  const navigate = useNavigate();
  const { objectName, objectId, objectView } = useParams();

  const [correctJson, setCorrectJson] = useState<IJson | null>(null);

  const itemMutation = useQueryMutationWithClient<
    {
      function: (client: IDeskproClient, id: string) => Promise<unknown>;
      id: string;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  >((client, data) => data?.function(client, data.id));

  useInitialisedDeskproAppClient(
    (client) => {
      if (!itemMutation.isSuccess || !objectName) return;

      if (objectView === "list") {
        client.setTitle(
          `${correctJson?.title}s ${capitalizeFirstLetter(objectView)}`
        );

        return;
      }

      if (
        objectName === "Customer" ||
        (objectName === "Invoice" && objectView === "single")
      ) {
        client.deregisterElement("plusButton");
      }

      client.registerElement("editButton", {
        type: "edit_button",
      });

      client.deregisterElement("menuButton");

      if (objectView === "single") {
        client.setTitle(
          getTitle(itemMutation.data.QueryResponse[objectName][0], objectName)
        );

        return;
      }
      client.setTitle(
        itemMutation.data.QueryResponse[objectName][0][
          correctJson?.titleKeyName as string
        ] || capitalizeFirstLetter(objectName || "")
      );
    },
    [itemMutation.isSuccess, objectView, objectName]
  );

  useEffect(() => {
    switch (objectName) {
      case "Customer": {
        itemMutation.mutate({
          id: objectId,
          function: getCustomerById,
        });

        setCorrectJson(customerJson);

        break;
      }
      case "Invoice": {
        itemMutation.mutate({
          id: objectId,
          function:
            objectView === "single" ? getInvoiceById : getInvoicesByCustomerId,
        });

        setCorrectJson(invoiceJson);

        break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objectName, objectId]);

  useDeskproAppEvents({
    async onElementEvent(id) {
      switch (id) {
        case "homeButton":
          navigate("/redirect");

          break;

        case "editButton":
          navigate(`/edit/${objectName}/${objectId}`);

          break;

        case "plusButton":
          navigate(`/create/${objectName}`);

          break;
      }
    },
  });

  if (!objectView || (objectView !== "list" && objectView !== "single"))
    return <H2>Please use a accepted Object View</H2>;

  if (
    objectName !== "Customer" &&
    objectName !== "Invoice" &&
    objectName !== "Bill" &&
    objectName !== "PurchaseOrder"
  )
    return <H2>Please use an accepted Object</H2>;

  if (!itemMutation.data || !correctJson) {
    return <LoadingSpinnerCenter />;
  }

  return (
    <FieldMapping
      fields={itemMutation.data.QueryResponse[objectName]}
      metadata={correctJson[objectView]}
      childTitleAccessor={
        objectView === "list" ? (e) => getTitle(e, objectName) : undefined
      }
      idKey={correctJson.idKey}
      internalChildUrl={
        objectView === "single" ? undefined : correctJson.internalChildUrl
      }
    />
  );
};
