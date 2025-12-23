namespace Predict.Readers.AccountStatement

open IronXL
open Predict.Types.TransactionTypes
open Predict.Utils
open Predict.DatabaseAccess
open Predict.Types.CommonTypes

module RevolutExcelAccountStatement =

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


    let getTransactions (excel: WorkBook) userId: ParsedTransaction list =
        ExcelUtils.getExcelValues excel
        |> Seq.toList
        |> List.choose (fun row ->
            let date = row[2]
            match date with
            | null -> None
            | _ -> 
                Some {
                    Identifier = None
                    RegistrationDate = DateTimeUtils.convertStringToUTCDate (date |> Some) "M/d/yyyy h:mm:ss tt"
                    CompletionDate = DateTimeUtils.convertStringToUTCDate (row[3] |> Some) "M/d/yyyy h:mm:ss tt"
                    Amount = row[5] |> Some |> ParserUtils.tryGetDouble
                    Fee = row[6] |> Some |> ParserUtils.tryGetDouble
                    Currency = ParserUtils.getCurrency (row[7])
                    Description = row[4] |> Some
                    TransactionType = getTranasctionType (row[0])
                    ReferenceId = None
                    Provider = Provider.REVOLUT |> Some
                }
        )
        |> List.groupBy(fun t -> t.RegistrationDate, t.Amount)
        |> List.map(fun (_, t) -> ParserUtils.mapTransactions t userId )
        |> List.concat
        |> List.distinctBy(fun t -> t.Identifier)


    let readExcels dataOwnerId (excels: WorkBook list) =
        let parsedTransaction =
            excels 
            |> List.map(fun excel -> getTransactions excel dataOwnerId)
            |> List.concat
            |> List.distinctBy(fun t -> t.Identifier)

        StoreTransactions.storeTransaction dataOwnerId parsedTransaction

