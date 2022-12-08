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
        |  true -> TransactionType.TopUp |> Some
        |  false -> TransactionType.CardPayment |> Some
            
    
    let getDescription (rows: RangeRow list) (index: int) = 
        let description1 = rows[index].Columns.ElementAtOrDefault(3).ToString()
        let mutable nextRowIndex = index + 1
        let description2 =
            match nextRowIndex < rows.Length with
            | true ->
                match rows[nextRowIndex].Columns.ElementAtOrDefault(0).ToString() with
                | "" -> rows[nextRowIndex].Columns.ElementAtOrDefault(3).ToString()
                | _ -> ""
            | _ -> ""
        nextRowIndex <- index + 2
        let description3 =
            match nextRowIndex < rows.Length with
            | true ->
                match rows[nextRowIndex].Columns.ElementAtOrDefault(0).ToString() with
                | "" -> rows[nextRowIndex].Columns.ElementAtOrDefault(3).ToString()
                | _ -> ""
            | _ -> ""

        description1 + description2 + description3
        

    let mapTransactions (transaction: RawParsedTransaction list): ParsedTransaction list =
        transaction
        |> List.indexed
        |> List.map(fun (i, rpt)-> 
            {   
                Id = ParserUtils.generateUniqueGuid rpt.RegistrationDate rpt.CompletionDate rpt.Amount i Provider.OrangeMoney
                RegistrationDate = rpt.RegistrationDate
                CompletionDate = rpt.CompletionDate
                Amount = rpt.Amount
                Description = rpt.Description
                TransactionType = rpt.TransactionType
                Currency = rpt.Currency
                Fee =  rpt.Fee
                Status = rpt.Status
                Provider = Provider.OrangeMoney |> Some
            }
        )


    let getTransactions (excel: WorkBook): ParsedTransaction list =
        let rows = 
            excel.DefaultWorkSheet.Rows
            |> Seq.toList
        rows
        |> List.indexed
        |> List.map (fun (i, row) ->
            let date = row.ElementAtOrDefault(0).ToString()
            match date with
            | null -> None
            | _ -> 
                 match Regex.IsMatch(date, DATE_REGEX) with
                 | false -> None
                 | _ -> 
                     let amount = row.Columns.ElementAtOrDefault(4).DoubleValue
                     Some {
                         RegistrationDate = DateTimeUtils.convertStringToUTCDate (date |> Some) "M/d/yyyy h:mm:ss tt"
                         CompletionDate = DateTimeUtils.convertStringToUTCDate (row.ElementAtOrDefault(1).ToString() |> Some) "M/d/yyyy h:mm:ss tt"
                         Amount = amount |> Some
                         Fee = None
                         Currency = CurrencyType.RON |> Some
                         Description = getDescription rows i |> Some
                         TransactionType = getTranasctionType amount
                         Status = TransactionStatus.Completed |> Some
                     }
        )
        |> List.filter (fun d -> d.IsSome)
        |> List.choose(fun t -> t)
        |> List.groupBy(fun t -> t.RegistrationDate, t.Amount)
        |> List.map(fun (_, t) -> mapTransactions t )
        |> List.concat
        |> List.distinctBy(fun t -> t.Id)


    let parseExcels (excels: WorkBook list): ParsedTransaction list =
        excels 
        |> List.toArray
        |> Array.chunkBySize 100
        |> Array.Parallel.map (fun chunk ->
            chunk 
            |> Array.toList
            |> List.map(fun excel -> getTransactions excel)
            |> List.concat
        )
        |> List.concat
        |> List.distinctBy(fun t -> t.Id)

