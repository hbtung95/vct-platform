/**
 * Export utility functions for admin pages.
 * Handles CSV and JSON download with proper UTF-8 BOM for Vietnamese.
 */

interface ExportCSVOptions {
    headers: string[]
    rows: string[][]
    filename: string
}

/**
 * Download data as CSV file with UTF-8 BOM (supports Vietnamese characters).
 */
export function exportToCSV({ headers, rows, filename }: ExportCSVOptions) {
    const headerLine = headers.join(',')
    const dataLines = rows.map(row =>
        row.map(cell => {
            // Wrap in quotes if contains comma, newline, or quotes
            if (cell.includes(',') || cell.includes('\n') || cell.includes('"')) {
                return `"${cell.replace(/"/g, '""')}"`
            }
            return cell
        }).join(',')
    )
    const csv = [headerLine, ...dataLines].join('\n')
    downloadBlob(csv, filename, 'text/csv;charset=utf-8;')
}

interface ExportJSONOptions {
    data: unknown
    filename: string
}

/**
 * Download data as JSON file.
 */
export function exportToJSON({ data, filename }: ExportJSONOptions) {
    const json = JSON.stringify(data, null, 2)
    downloadBlob(json, filename, 'application/json')
}

function downloadBlob(content: string, filename: string, mimeType: string) {
    const blob = new Blob(['\uFEFF' + content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
}
