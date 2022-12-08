namespace DataAnalysis.Parsers

open IronXL
open System.Linq
open System
open DataAnalysis.Types.ParsersTypes
open DataAnalysis.Utils

module ParserRevolutExcelAccountStatement =

    let DATE_REGEX = @"\d{2}/\d{2}/\d{4}\d{2}:\d{2}:\d{2}([A-Z]{2})";

    
    let getTranasctionType (transactionType: string ): TransactionType option = 
        match transactionType with
        |  "TOPUP" -> TransactionType.TopUp |> Some
        |  "FEE" -> TransactionType.FEE |> Some
        |  "ATM" -> TransactionType.ATM |> Some
        |  "CARD_PAYMENT" -> TransactionType.CardPayment |> Some
        |  "TRANSFER" -> TransactionType.Transfer |> Some
        |  "REWARD" -> TransactionType.Reward |> Some
        |  "EXCHANGE" -> TransactionType.Exchange |> Some
        |  "CARD_REFUND" -> TransactionType.Refund |> Some
        | _ -> None


    let getTranasctionStatus (transactionType: string ): TransactionStatus option = 
        match transactionType with
        |  "COMPLETED" -> TransactionStatus.Completed |> Some
        | _ -> None
            

    let mapTransactions (transaction: RawParsedTransaction list): ParsedTransaction list =
        transaction
        |> List.indexed
        |> List.map(fun (i, rpt)-> 
            {   
                Id = ParserUtils.generateUniqueGuid rpt.RegistrationDate rpt.CompletionDate rpt.Amount i Provider.Revolut
                RegistrationDate = rpt.RegistrationDate
                CompletionDate = rpt.CompletionDate
                Amount = rpt.Amount
                Description = rpt.Description
                TransactionType = rpt.TransactionType
                Currency = rpt.Currency
                Fee =  rpt.Fee
                Status = rpt.Status
                Provider = Provider.Revolut |> Some
            }
        )


    let getTransactions (excel: WorkBook): ParsedTransaction list =
        excel.DefaultWorkSheet.Rows
        |> Seq.toList
        |> List.map (fun row ->
            let date = row.ElementAtOrDefault(2).ToString()
            match date with
            | null -> None
            | _ -> 
                Some {
                    RegistrationDate = DateTimeUtils.convertStringToUTCDate (date |> Some) "M/d/yyyy h:mm:ss tt"
                    CompletionDate = DateTimeUtils.convertStringToUTCDate (row.ElementAtOrDefault(3).ToString() |> Some) "M/d/yyyy h:mm:ss tt"
                    Amount = row.Columns.ElementAtOrDefault(5).DoubleValue |> Some
                    Fee = row.Columns.ElementAtOrDefault(6).DoubleValue |> Some
                    Currency = ParserUtils.getCurrency (row.Columns.ElementAtOrDefault(7).ToString())
                    Description = row.Columns.ElementAtOrDefault(4).ToString() |> Some
                    TransactionType = getTranasctionType (row.Columns.ElementAtOrDefault(0).ToString())
                    Status = getTranasctionStatus (row.Columns.ElementAtOrDefault(8).ToString())
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

