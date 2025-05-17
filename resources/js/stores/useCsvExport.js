export function generateCsv(headers, rows) {
    const csvRows = [
        headers.join(','),
        ...rows.map(row =>
            row
                .map(cell =>
                    typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))
                        ? `"${cell.replace(/"/g, '""')}"`
                        : cell
                )
                .join(',')
        ),
    ]
    return csvRows.join('\r\n')
}
