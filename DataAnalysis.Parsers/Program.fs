open System.IO
open IronXL
open DataAnalysis.Parsers

module ParserConsole =


    let getLocalExcels path =
        Directory.EnumerateFiles(path, "*.xlsx")
        |> Seq.toList 
        |> List.map(fun f -> Path.Combine(path, f) |> WorkBook.Load)


    [<EntryPoint>]
    let main _ =
    
        let raitransactions = 
            getLocalExcels @"C:\Users\badicl\Desktop\My shortcuts\Raiff-Excels" 
            |> ParserRaiffeisenExcelAccountStatement.parseExcels
            |> List.map(fun t -> 
                printfn "%O" t
                t 
            )

        let revtransactions = 
            getLocalExcels @"C:\Users\badicl\Desktop\My shortcuts\Revolut-Excels"
            |> ParserRevolutExcelAccountStatement.parseExcels
            |> List.map(fun t -> 
                printfn "%O" t
                t 
            )
            
        let omtransactions =
            getLocalExcels @"C:\Users\badicl\Desktop\My shortcuts\OM\Excels"
            |> ParserOrangeMoneyExcelAccountStatement.parseExcels
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