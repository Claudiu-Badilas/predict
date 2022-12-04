open System.IO
open IronXL
open DataAnalysis.Parsers
open System

module ParserConsole =


    [<EntryPoint>]
    let main _ =
        let folderPath = @""

        let excelFiles = 
            Directory.EnumerateFiles(folderPath, "*.xlsx")
            |> Seq.toArray 
            |> Array.Parallel.map(fun f -> WorkBook.Load(Path.Combine(folderPath, f)))
            |> Array.toList
        
        let transactions = 
            RaiffeisenExcelAccountStatement.parseRaiffExcels excelFiles
            |> List.map(fun t -> 
                printfn "%O" t
                t 
            )

        0