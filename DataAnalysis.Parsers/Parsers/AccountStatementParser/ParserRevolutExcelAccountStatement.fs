namespace DataAnalysis.Parsers.AccountStatementParser

open IronXL
open System.Linq
open System
open DataAnalysis.Types.ParsersTypes
open DataAnalysis.Utils
open DataAnalysis.DatabaseAccess

module ParserRevolutExcelAccountStatement =

    let DATE_REGEX = @"\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}:\d{2}";

    
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
        |  _ -> TransactionType.UNDEFINED |> Some


    let getTranasctionStatus (transactionType: string ): TransactionStatus option = 
        match transactionType with
        |  "COMPLETED" -> TransactionStatus.COMPLETED |> Some
        | _ -> None


    let getTransactions (excel: WorkBook) userId: ParsedTransaction list =
        ExcelUtils.getExcelValues excel
        |> Seq.toList
        |> List.map (fun row ->
            let date = row[2]
            match date with
            | null -> None
            | _ -> 
                Some {
                    Id = None
                    RegistrationDate = DateTimeUtils.convertStringToUTCDate (date |> Some) "dd.MM.yyyy HH:mm:ss"
                    CompletionDate = DateTimeUtils.convertStringToUTCDate (row[3] |> Some) "dd.MM.yyyy HH:mm:ss"
                    Amount = row[5] |> Some |> ParserUtils.tryGetDouble
                    Fee = row[6] |> Some |> ParserUtils.tryGetDouble
                    Currency = ParserUtils.getCurrency (row[7])
                    Description = row[4] |> Some
                    TransactionType = getTranasctionType (row[0])
                    Status = getTranasctionStatus (row[8])      
                    ReferenceId = None
                    Provider = Provider.REVOLUT |> Some
                }
        )
        |> List.filter (fun d -> d.IsSome)
        |> List.choose(fun t -> t)
        |> List.groupBy(fun t -> t.RegistrationDate, t.Amount)
        |> List.map(fun (_, t) -> ParserUtils.mapTransactions t userId )
        |> List.concat
        |> List.distinctBy(fun t -> t.Id)


    let parseExcels userId (excels: WorkBook list) =
        let parsedTransaction =
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

        StoreTransactions.storeTransaction userId parsedTransaction

