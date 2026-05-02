export type WorkbookCellKind = "input" | "select" | "formula" | "label";

export type WorkbookCellOption = {
  label: string;
  value: string | number;
};

export type WorkbookCellValue = string | number | null;

export type WorkbookCellDefinition = {
  ref: string;
  label: string;
  kind: WorkbookCellKind;
  value: WorkbookCellValue;
  formula?: string;
  options?: WorkbookCellOption[];
  hint?: string;
};

export type WorkbookRowDefinition = {
  title: string;
  cells: WorkbookCellDefinition[];
};

export type WorkbookSheetDefinition = {
  sheetId: string;
  title: string;
  rows: WorkbookRowDefinition[];
};

export function asCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(value);
}

