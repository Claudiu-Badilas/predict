open System.IO
open IronXL
open DataAnalysis.Parsers
open System

module ParserConsole =


    let getLocalExcels path =
        Directory.EnumerateFiles(path, "*.xlsx")
        |> Seq.toArray 
        |> Array.Parallel.map(fun f -> WorkBook.Load(Path.Combine(path, f)))
        |> Array.toList


    [<EntryPoint>]
    let main _ =
        
        let transactions = 
            RaiffeisenExcelAccountStatement.parseRaiffExcels excelFiles
            |> List.map(fun t -> 
                printfn "%O" t
                t 
            )

        0