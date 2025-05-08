import { Stack } from "@deskpro/deskpro-ui";
import { ThemeProps } from "@/types/general";
import styled from "styled-components";

const StyledErrorBlock = styled(Stack)`
  width: 100%;
  margin-bottom: 8px;
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 12px;
  color: ${({ theme }: ThemeProps) => theme.colors.white};
  background-color: ${({ theme }: ThemeProps) => theme.colors.red100};
`;

export default function ErrorBlock(props: React.ComponentProps<typeof Stack>) {
  return <StyledErrorBlock {...props} />;
}