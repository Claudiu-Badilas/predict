open System.IO
open IronXL
open DataAnalysis.Parsers

module ParserConsole =


    let getLocalExcels path =
        Directory.EnumerateFiles(path, "*.xlsx")
        |> Seq.toList 
        |> List.map(fun f -> WorkBook.Load(Path.Combine(path, f)))


    [<EntryPoint>]
    let main _ =
    
        let raitransactions = 
            ParserRaiffeisenExcelAccountStatement.parseExcels (getLocalExcels @"")
            |> List.map(fun t -> 
                printfn "%O" t
                t 
            )

        let revtransactions = 
            ParserRevolutExcelAccountStatement.parseExcels (getLocalExcels @"")
            |> List.map(fun t -> 
                printfn "%O" t
                t 
            )
            
        let omtransactions = 
            ParserOrangeMoneyExcelAccountStatement.parseExcels (getLocalExcels @"")
            |> List.map(fun t -> 
                printfn "%O" t
                t 
            )

        printfn "omtransactions %O" omtransactions.Length
        printfn "raitransactions %O" raitransactions.Length
        printfn "revtransactions %O" revtransactions.Length

        let allTransactions = raitransactions @ revtransactions @ omtransactions

        let filtereddublicate = 
            allTransactions
            |> List.distinctBy(fun t -> t.Id)

        printfn "allTransactions %O" allTransactions.Length
        printfn "filtereddublicate %O" filtereddublicate.Length
        0