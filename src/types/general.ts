import { DeskproTheme, DropdownValueType } from "@deskpro/deskpro-ui";

export type Dict<T> = Record<string, T>;

export type Option<Value = unknown> = Omit<DropdownValueType<Value>, "subItems">;

export interface ThemeProps {
    theme: DeskproTheme;
}