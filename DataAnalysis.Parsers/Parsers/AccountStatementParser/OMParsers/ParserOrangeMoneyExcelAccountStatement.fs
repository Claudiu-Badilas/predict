namespace DataAnalysis.Parsers.OMParsers.AccountStatementParser

open IronXL
open DataAnalysis.Types.TransactionTypes
open DataAnalysis.Types.CommonTypes
open DataAnalysis.Utils
open System.Text.RegularExpressions
open DataAnalysis.DatabaseAccess

module ParserOrangeMoneyExcelAccountStatement =

    let DATE_REGEX = @"\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}:\d{2}";

    
    let getTranasctionType amount = 
        match amount > 0.0 with
        |  true -> TransactionType.TOP_UP |> Some
        |  false -> TransactionType.CARD_PAYMENT |> Some
            
    
    let getDescription (rows: string [][]) (index: int) = 
        [1; 2]
        |> List.map(fun v ->
            let nextRowIndex = index + v
            match nextRowIndex < rows.Length with
            | true ->
                match rows[nextRowIndex][0] with
                | "" -> rows[nextRowIndex][3]
                | _ -> ""
            | _ -> ""
        )
        |> List.append [rows[index][3]]
        |> List.fold (+) ""


    let getTransactions (excel: WorkBook) userId: ParsedTransaction list =
        let rows = ExcelUtils.getExcelValues excel
        rows
        |> Seq.toList
        |> List.indexed
        |> List.map (fun (i, row) ->
            let date = row[0]
            match date with
            | null -> None
            | _ -> 
                 match Regex.IsMatch(date, DATE_REGEX) with
                 | false -> None
                 | _ -> 
                     let amount = row[4] |> Some |> ParserUtils.tryGetDouble
                     Some {
                         Identifier = None
                         RegistrationDate = DateTimeUtils.convertStringToUTCDate (date |> Some) "d.M.yyyy h:mm:ss"
                         CompletionDate = DateTimeUtils.convertStringToUTCDate (row[1] |> Some) "d.M.yyyy h:mm:ss"
                         Amount = amount
                         Fee = None
                         Currency = CurrencyType.RON |> Some
                         Description = getDescription rows i |> Some
                         TransactionType = getTranasctionType amount.Value
                         ReferenceId = row[2] |> Some |> ParserUtils.tryGetInt
                         Provider = Provider.ORANGE_MONEY |> Some
                     }
        )
        |> List.filter (fun d -> d.IsSome)
        |> List.choose(fun t -> t)
        |> List.groupBy(fun t -> t.RegistrationDate, t.Amount)
        |> List.map(fun (_, t) -> ParserUtils.mapTransactions t userId )
        |> List.concat
        |> List.distinctBy(fun t -> t.Identifier)


    let parseExcels userId (excels: WorkBook list) =
        let parsedTransaction =
            excels 
            |> List.map(fun excel -> getTransactions excel userId)
            |> List.concat
            |> List.distinctBy(fun t -> t.Identifier)

        StoreTransactions.storeTransaction userId parsedTransaction


