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
        |  "TOPUP" -> TransactionType.TOP_UP |> Some
        |  "FEE" -> TransactionType.FEE |> Some
        |  "ATM" -> TransactionType.ATM |> Some
        |  "CARD_PAYMENT" -> TransactionType.CARD_PAYMENT |> Some
        |  "TRANSFER" -> TransactionType.TRANSFER |> Some
        |  "REWARD" -> TransactionType.REWARD |> Some
        |  "EXCHANGE" -> TransactionType.EXCHANGE |> Some
        |  "CARD_REFUND" -> TransactionType.REFUND |> Some
        | _ -> None


    let getTranasctionStatus (transactionType: string ): TransactionStatus option = 
        match transactionType with
        |  "COMPLETED" -> TransactionStatus.COMPLETED |> Some
        | _ -> None
            

    let mapTransactions (transaction: RawParsedTransaction list) userId: ParsedTransaction list =
        transaction
        |> List.indexed
        |> List.map(fun (i, rpt)-> 
            let provider = Provider.REVOLUT
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
        ExcelUtils.getExcelValues excel
        |> Seq.toList
        |> List.map (fun row ->
            let date = row[2]
            match date with
            | null -> None
            | _ -> 
                Some {
                    RegistrationDate = DateTimeUtils.convertStringToUTCDate (date |> Some) "M/d/yyyy h:mm:ss tt"
                    CompletionDate = DateTimeUtils.convertStringToUTCDate (row[3] |> Some) "M/d/yyyy h:mm:ss tt"
                    Amount = row[5] |> Some |> ParserUtils.tryGetFloat
                    Fee = row[6] |> Some |> ParserUtils.tryGetFloat
                    Currency = ParserUtils.getCurrency (row[7])
                    Description = row[4] |> Some
                    TransactionType = getTranasctionType (row[0])
                    Status = getTranasctionStatus (row[8])
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

