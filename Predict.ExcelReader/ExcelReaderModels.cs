namespace ExcelReader;

public class CellData
{
    public int Row { get; set; }
    public int Column { get; set; }
    public string CellReference { get; set; }   // e.g. "A1", "B3"
    public string Value { get; set; }
    public string DataType { get; set; }        // "s"=string, "n"=number, "b"=bool
}

public class SheetData
{
    public string SheetName { get; set; }
    public List<string> Headers { get; set; } = new();
    public List<Dictionary<string, string>> Rows { get; set; } = new();
    public List<List<CellData>> RawData { get; set; } = new();
    public int TotalRows => RawData.Count;
    public int TotalColumns => Headers.Count;
}

public class ExcelData
{
    public string FilePath { get; set; }
    public List<string> SheetNames { get; set; } = new();
    public Dictionary<string, SheetData> Sheets { get; set; } = new();
}