namespace Predict.Utils

open IronXL
open System.IO

module ExcelUtils =

    let getExcelValues (excel: WorkBook) = 
        excel.DefaultWorkSheet.Rows
        |> Seq.toArray
        |> Array.map(fun row ->
            row.Columns
            |> Seq.toArray
            |> Array.map(fun cell -> string cell) 
        )
        

    let getCsvValues (csv: StreamReader) = 
        let mutable rows = []
        while not csv.EndOfStream do
            let values = csv.ReadLine().Split(',') |> Array.toList
            rows <- values :: rows
        csv.Close()
        rows
        

