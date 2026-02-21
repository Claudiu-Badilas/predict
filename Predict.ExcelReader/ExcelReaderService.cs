using System.IO.Compression;
using System.Xml.Linq;

namespace ExcelReader;


// ── Core reader — ZERO external dependencies ───────────────────────────────
// An .xlsx file is simply a ZIP archive of XML files.
// We open it with System.IO.Compression and parse XML with System.Xml.Linq —
// both are part of the .NET standard library, no NuGet packages needed.

public class ExcelReaderService
{
    // XML namespaces used inside xlsx files
    private static readonly XNamespace _ns = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
    private static readonly XNamespace _relNs = "http://schemas.openxmlformats.org/package/2006/relationships";
    private static readonly XNamespace _wbRelNs = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";

    // ── Public API ────────────────────────────────────────────────────────

    /// <summary>Reads every sheet in the workbook.</summary>
    public ExcelData ReadAllSheets(string filePath)
    {
        ValidateFile(filePath);

        using var zip = ZipFile.OpenRead(filePath);

        var sharedStrings = ReadSharedStrings(zip);
        var sheetEntries = GetSheetEntries(zip);

        var result = new ExcelData { FilePath = filePath };

        foreach (var (name, entry) in sheetEntries)
        {
            result.SheetNames.Add(name);
            result.Sheets[name] = ParseSheet(name, entry, sharedStrings);
        }

        return result;
    }

    /// <summary>Reads a single sheet by name.</summary>
    public SheetData ReadSheet(string filePath, string sheetName)
    {
        ValidateFile(filePath);

        using var zip = ZipFile.OpenRead(filePath);

        var sharedStrings = ReadSharedStrings(zip);
        var sheetEntries = GetSheetEntries(zip);

        var match = sheetEntries.FirstOrDefault(
            s => s.name.Equals(sheetName, StringComparison.OrdinalIgnoreCase));

        if (match.entry == null)
            throw new ArgumentException(
                $"Sheet '{sheetName}' not found. Available: {string.Join(", ", sheetEntries.Select(s => s.name))}");

        return ParseSheet(match.name, match.entry, sharedStrings);
    }

    /// <summary>Reads a single sheet by zero-based index.</summary>
    public SheetData ReadSheetByIndex(string filePath, int index)
    {
        ValidateFile(filePath);

        using var zip = ZipFile.OpenRead(filePath);

        var sharedStrings = ReadSharedStrings(zip);
        var sheetEntries = GetSheetEntries(zip);

        if (index < 0 || index >= sheetEntries.Count)
            throw new IndexOutOfRangeException(
                $"Index {index} is out of range. Workbook has {sheetEntries.Count} sheet(s).");

        var (name, entry) = sheetEntries[index];
        return ParseSheet(name, entry, sharedStrings);
    }

    // ── Internal helpers ──────────────────────────────────────────────────

    private static void ValidateFile(string filePath)
    {
        if (!File.Exists(filePath))
            throw new FileNotFoundException($"File not found: {filePath}");
        if (!Path.GetExtension(filePath).Equals(".xlsx", StringComparison.OrdinalIgnoreCase))
            throw new ArgumentException("Only .xlsx files are supported.");
    }

    // Excel stores all unique strings in a shared table (xl/sharedStrings.xml).
    // Cells that contain text hold an integer index into this table, not the string itself.
    private static List<string> ReadSharedStrings(ZipArchive zip)
    {
        var strings = new List<string>();
        var entry = zip.GetEntry("xl/sharedStrings.xml");

        if (entry == null) return strings; // Workbook has no text cells

        using var stream = entry.Open();
        var doc = XDocument.Load(stream);

        // Each <si> element is one string; it may have multiple rich-text <r><t> runs
        foreach (var si in doc.Root!.Elements(_ns + "si"))
        {
            var text = string.Concat(si.Descendants(_ns + "t").Select(t => t.Value));
            strings.Add(text);
        }

        return strings;
    }

    // Reads xl/workbook.xml + xl/_rels/workbook.xml.rels to map
    // sheet names → their ZipArchiveEntry (the actual XML file inside the zip).
    private static List<(string name, ZipArchiveEntry entry)> GetSheetEntries(ZipArchive zip)
    {
        var result = new List<(string, ZipArchiveEntry)>();

        // 1. workbook.xml — contains <sheet name="..." r:id="rId1" ... />
        var wbEntry = zip.GetEntry("xl/workbook.xml")
            ?? throw new InvalidOperationException("Invalid .xlsx: missing xl/workbook.xml");

        using var wbStream = wbEntry.Open();
        var wbDoc = XDocument.Load(wbStream);

        var sheetElements = wbDoc.Root!
            .Descendants(_ns + "sheet")
            .ToList();

        // 2. workbook.xml.rels — maps each rId to a relative file path
        var relsEntry = zip.GetEntry("xl/_rels/workbook.xml.rels")
            ?? throw new InvalidOperationException("Invalid .xlsx: missing workbook relationships");

        using var relsStream = relsEntry.Open();
        var relsDoc = XDocument.Load(relsStream);

        var relationships = relsDoc.Root!
            .Elements(_relNs + "Relationship")
            .ToDictionary(
                r => r.Attribute("Id")!.Value,
                r => r.Attribute("Target")!.Value);

        // 3. Match each sheet element to its zip entry
        foreach (var sheet in sheetElements)
        {
            var sheetName = sheet.Attribute("name")!.Value;
            var rId = sheet.Attribute(_wbRelNs + "id")!.Value;

            if (!relationships.TryGetValue(rId, out var target)) continue;

            // Target is relative to xl/ (e.g. "worksheets/sheet1.xml")
            var path = target.StartsWith("/") ? target.TrimStart('/') : $"xl/{target}";
            var zipEntry = zip.GetEntry(path);

            if (zipEntry != null)
                result.Add((sheetName, zipEntry));
        }

        return result;
    }

    // Parses a single worksheet XML into a SheetData object.
    private static SheetData ParseSheet(string name, ZipArchiveEntry entry, List<string> sharedStrings)
    {
        using var stream = entry.Open();
        var doc = XDocument.Load(stream);

        var sheetData = new SheetData { SheetName = name };

        var rows = doc.Root!
            .Descendants(_ns + "sheetData")
            .Elements(_ns + "row")
            .ToList();

        if (rows.Count == 0) return sheetData;

        // Find the highest column index used across all rows
        int maxCol = rows
            .SelectMany(r => r.Elements(_ns + "c"))
            .Select(c => ColLetterToIndex(SplitCellRef(c.Attribute("r")?.Value ?? "A1").col))
            .DefaultIfEmpty(1)
            .Max();

        // First row = headers
        var headerCells = ParseRow(rows[0], sharedStrings, maxCol);
        sheetData.Headers = headerCells
            .Select(c => string.IsNullOrWhiteSpace(c.Value) ? $"Column{c.Column}" : c.Value)
            .ToList();

        // Remaining rows = data
        for (int i = 1; i < rows.Count; i++)
        {
            var cells = ParseRow(rows[i], sharedStrings, maxCol);
            var rowDict = new Dictionary<string, string>();

            for (int col = 0; col < cells.Count; col++)
            {
                var header = col < sheetData.Headers.Count
                    ? sheetData.Headers[col]
                    : $"Column{col + 1}";

                rowDict[header] = cells[col].Value ?? "";
            }

            sheetData.Rows.Add(rowDict);
            sheetData.RawData.Add(cells);
        }

        return sheetData;
    }

    // Parses every <c> element in a <row>, filling gaps so columns stay aligned.
    private static List<CellData> ParseRow(XElement rowEl, List<string> sharedStrings, int maxCol)
    {
        var cellsMap = new Dictionary<int, CellData>();
        int rowNum = int.Parse(rowEl.Attribute("r")?.Value ?? "0");

        foreach (var c in rowEl.Elements(_ns + "c"))
        {
            var cellRef = c.Attribute("r")?.Value ?? "";
            var colIndex = ColLetterToIndex(SplitCellRef(cellRef).col);
            var dataType = c.Attribute("t")?.Value ?? "n";

            var rawVal = c.Element(_ns + "v")?.Value
                      ?? c.Element(_ns + "is")?.Element(_ns + "t")?.Value
                      ?? "";

            // Resolve the actual display value based on data-type attribute
            string value = dataType switch
            {
                "s" => int.TryParse(rawVal, out int idx) && idx < sharedStrings.Count
                                   ? sharedStrings[idx]
                                   : rawVal,
                "inlineStr" => c.Element(_ns + "is")?.Element(_ns + "t")?.Value ?? rawVal,
                "b" => rawVal == "1" ? "TRUE" : "FALSE",
                "e" => rawVal,   // error value, e.g. "#DIV/0!"
                _ => rawVal    // number or date serial number
            };

            cellsMap[colIndex] = new CellData
            {
                Row = rowNum,
                Column = colIndex,
                CellReference = cellRef,
                Value = value,
                DataType = dataType
            };
        }

        // Fill every slot from 1 to maxCol so rows are always the same length
        var result = new List<CellData>(maxCol);
        for (int col = 1; col <= maxCol; col++)
        {
            result.Add(cellsMap.TryGetValue(col, out var cell)
                ? cell
                : new CellData { Row = rowNum, Column = col, CellReference = "", Value = "", DataType = "n" });
        }

        return result;
    }

    // Splits "AB12" → ("AB", "12")
    private static (string col, string row) SplitCellRef(string cellRef)
    {
        int i = 0;
        while (i < cellRef.Length && char.IsLetter(cellRef[i])) i++;
        return (cellRef[..i], cellRef[i..]);
    }

    // "A"→1, "Z"→26, "AA"→27, "AZ"→52 …
    private static int ColLetterToIndex(string letters)
    {
        int result = 0;
        foreach (char ch in letters.ToUpperInvariant())
            result = result * 26 + (ch - 'A' + 1);
        return result;
    }
}