namespace DataAnalysis.Parsers

open IronXL
open System.Linq
open System
open DataAnalysis.Types.ParsersTypes
open DataAnalysis.Utils

module ParserRevolutExcelAccountStatement =

    let DATE_REGEX = @"\d{2}/\d{2}/\d{4}\d{2}:\d{2}:\d{2}([A-Z]{2})";


    let checkDescriptionByText (description: string ) (text: string): string list =
        description.Split("|")
        |> Array.toList
        |> List.filter(fun d -> d.Contains(text))

    
    let getTranasctionType (transactionType: string ): TransactionType option = 
        match transactionType with
        |  "TOPUP" -> Some TransactionType.TopUp
        |  "FEE" -> Some TransactionType.FEE
        |  "ATM" -> Some TransactionType.ATM
        |  "CARD_PAYMENT" -> Some TransactionType.CardPayment
        |  "TRANSFER" -> Some TransactionType.Transfer
        |  "REWARD" -> Some TransactionType.Reward
        |  "EXCHANGE" -> Some TransactionType.Exchange
        |  "CARD_REFUND" -> Some TransactionType.Refund
        | _ -> None


    let getTranasctionStatus (transactionType: string ): TransactionStatus option = 
        match transactionType with
        |  "COMPLETED" -> Some TransactionStatus.Completed
        | _ -> None
            

    let mapTransactions (transaction: RawParsedTransaction list): ParsedTransaction list =
        transaction
        |> List.indexed
        |> List.map(fun (i, rpt)-> 
            {   
                Id = ParserUtils.generateUniqueGuid rpt.RegistrationDate rpt.Amount i
                RegistrationDate = rpt.RegistrationDate
                CompletionDate = rpt.CompletionDate
                Amount = rpt.Amount
                Description = rpt.Description
                TransactionType = rpt.TransactionType
                Currency = rpt.Currency
                Fee =  rpt.Fee
                Status = rpt.Status
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
                    RegistrationDate = DateTimeUtils.convertStringToUTCDate (Some date) "M/d/yyyy h:mm:ss tt"
                    CompletionDate = DateTimeUtils.convertStringToUTCDate (Some (row.ElementAtOrDefault(3).ToString())) "M/d/yyyy h:mm:ss tt"
                    Amount = Some (row.Columns.ElementAtOrDefault(5).DoubleValue)
                    Fee = Some (row.Columns.ElementAtOrDefault(6).DoubleValue)
                    Currency = ParserUtils.getCurrency (row.Columns.ElementAtOrDefault(7).ToString())
                    Description = Some (row.Columns.ElementAtOrDefault(4).ToString())
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


    let parseRevolutExcels (excels: WorkBook list): ParsedTransaction list =
        excels 
        |> List.choose(fun excel -> Some excel)
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

