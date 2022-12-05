open System.IO
open IronXL
open DataAnalysis.Parsers

module ParserConsole =


    let getLocalExcels path =
        Directory.EnumerateFiles(path, "*.xlsx")
        |> Seq.toArray 
        |> Array.Parallel.map(fun f -> WorkBook.Load(Path.Combine(path, f)))
        |> Array.toList


    [<EntryPoint>]
    let main _ =
    
        let raitransactions = 
            ParserRaiffeisenExcelAccountStatement.parseRaiffExcels (getLocalExcels @"")
            |> List.map(fun t -> 
                printfn "%O" t.Id.Value
                t 
            )

        let revtransactions = 
            ParserRevolutExcelAccountStatement.parseRevolutExcels (getLocalExcels @"")
            |> List.map(fun t -> 
                printfn "%O" t.Id.Value
                t 
            )

        printfn "%O" raitransactions.Length
        printfn "%O" revtransactions.Length

        let allTransactions = raitransactions @ revtransactions

        let filtered = 
            allTransactions
            |> List.distinctBy(fun t -> t.Id)

        printfn "%O" allTransactions.Length
        printfn "%O" filtered.Length
        0