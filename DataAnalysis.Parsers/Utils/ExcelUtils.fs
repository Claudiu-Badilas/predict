namespace DataAnalysis.Utils

open IronXL

module ExcelUtils =

    let getExcelValues (excel: WorkBook) = 
            excel.DefaultWorkSheet.Rows
            |> Seq.toArray
            |> Array.map(fun row ->
                row.Columns
                |> Seq.toArray
                |> Array.map(fun cell -> 
                    string cell
                ) 
            )
        

