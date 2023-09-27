import { useDeskproAppTheme } from "@deskpro/app-sdk";
import { RoundedLabelTag } from "@deskpro/deskpro-ui";
import { capitalizeFirstLetter } from "../../utils/utils";

type Props = {
  title: string | number;
};

export const CustomTag = ({ title }: Props) => {
  let color;

  const { theme } = useDeskproAppTheme();

  switch (title) {
    case "PAID": {
      color = theme?.colors?.cyan100;

      break;
    }
    case "AUTHORISED": {
      color = theme?.colors?.yellow100;

      break;
    }
    case "AWAITING PAYMENT": {
      color = theme?.colors?.red100;

      break;
    }

    case "APPROVED": {
      color = theme?.colors?.purple100;

      break;
    }

    case "BILLED": {
      color = theme?.colors?.green100;

      break;
    }

    default:
      color = theme?.colors?.grey100;
  }

  return (
    <RoundedLabelTag
      label={capitalizeFirstLetter(title as string)}
      backgroundColor={color}
      textColor="white"
    />
  );
};
