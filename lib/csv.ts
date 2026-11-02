export function csvCell(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export function csvFile(filename: string, header: string[], rows: unknown[][], excel = false) {
  const body = [header.map(csvCell).join(","), ...rows.map((row) => row.map(csvCell).join(","))].join("\n");
  const name = excel ? filename.replace(/\.csv$/i, ".xls") : filename;
  return new Response(`\uFEFF${body}`, {
    headers: {
      "Content-Type": excel
        ? "application/vnd.ms-excel; charset=utf-8"
        : "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}"`,
    },
  });
}
