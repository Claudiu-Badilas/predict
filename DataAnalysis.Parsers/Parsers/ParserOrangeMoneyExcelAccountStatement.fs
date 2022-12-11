namespace DataAnalysis.Parsers

open IronXL
open System.Linq
open System
open DataAnalysis.Types.ParsersTypes
open DataAnalysis.Utils
open System.Text.RegularExpressions

module ParserOrangeMoneyExcelAccountStatement =

    let DATE_REGEX = @"\d{1,2}/\d{1,2}/\d{4} \d{1,2}:\d{1,2}:\d{1,2} \w{2}";

    
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
        

    let mapTransactions (transaction: RawParsedTransaction list) userId: ParsedTransaction list =
        transaction
        |> List.indexed
        |> List.map(fun (i, rpt)-> 
            let provider = Provider.ORANGE_MONEY
            {   
                Id = ParserUtils.generateUniqueGuid userId rpt.RegistrationDate rpt.CompletionDate rpt.Amount i provider
                RegistrationDate = rpt.RegistrationDate
                CompletionDate = rpt.CompletionDate
                Amount = rpt.Amount
                Description = rpt.Description
                TransactionType = rpt.TransactionType
                Currency = rpt.Currency
                Fee =  rpt.Fee
                Status = rpt.Status
                Provider = provider |> Some
            }
        )


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
                     let amount = row[4] |> Some |> ParserUtils.tryGetFloat
                     Some {
                         RegistrationDate = DateTimeUtils.convertStringToUTCDate (date |> Some) "M/d/yyyy h:mm:ss tt"
                         CompletionDate = DateTimeUtils.convertStringToUTCDate (row[1] |> Some) "M/d/yyyy h:mm:ss tt"
                         Amount = amount
                         Fee = None
                         Currency = CurrencyType.RON |> Some
                         Description = getDescription rows i |> Some
                         TransactionType = getTranasctionType amount.Value
                         Status = TransactionStatus.COMPLETED |> Some
                     }
        )
        |> List.filter (fun d -> d.IsSome)
        |> List.choose(fun t -> t)
        |> List.groupBy(fun t -> t.RegistrationDate, t.Amount)
        |> List.map(fun (_, t) -> mapTransactions t userId )
        |> List.concat
        |> List.distinctBy(fun t -> t.Id)


    let parseExcels userId (excels: WorkBook list): ParsedTransaction list =
        excels 
        |> List.toArray
        |> Array.chunkBySize 100
        |> Array.Parallel.map (fun chunk ->
            chunk 
            |> Array.toList
            |> List.map(fun excel -> getTransactions excel userId)
            |> List.concat
        )
        |> List.concat
        |> List.distinctBy(fun t -> t.Id)

