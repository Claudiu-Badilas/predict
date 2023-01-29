namespace DataAnalysis.Utils

open DataAnalysis.Types.TransactionTypes
open DataAnalysis.Types.CommonTypes
open System
open System.Globalization
open DataAnalysis.Types.ReceiptTypes

module ParserUtils =

    let tryGetInt (value: string option) =
        match value with
        | Some value -> 
            let isValid, intValue = Int32.TryParse(value, NumberStyles.Any, CultureInfo.InvariantCulture)
            match isValid with
            | true -> intValue |> Some
            | _ -> None
        | _ -> None


    let tryGetDouble (value: string option) =
        match value with
        | Some value -> 
            let isValid, doubleValue = Double.TryParse(value.Replace(",", "."), NumberStyles.Any, CultureInfo.InvariantCulture)
            match isValid with
            | true -> doubleValue |> Some
            | _ -> None
        | _ -> None

    
    let getCurrency value =
        match value with
        | "RON" -> CurrencyType.RON |> Some
        | "EUR" -> CurrencyType.EUR |> Some
        | "USD" -> CurrencyType.USD |> Some
        | _ -> None
        

    let getTransactionProvider provider =
        match provider with
        | Some TransactionProvider.RAIFFEISEN -> "RAIFFEISEN" |> Some
        | Some TransactionProvider.REVOLUT -> "REVOLUT" |> Some
        | Some TransactionProvider.ORANGE_MONEY -> "ORANGE_MONEY" |> Some
        | _ -> "" |> Some
        

    let getReceiptProvider provider =
        match provider with
        | Some ReceiptProvider.CARREFOUR -> "CARREFOUR" |> Some
        | Some ReceiptProvider.KAUFLAND -> "KAUFLAND" |> Some
        | _ -> "" |> Some


    let format value = "[" + value + "]@"


    let formatOption value =
        match value with
        | Some value -> string value |> format
        | _ -> "" |> format


    let generateReceiptUniqueId (userId: int) (date: DateTime option) (amount: double option) (provider: ReceiptProvider option) =
        let userIdentifier = string userId |> format
        let dateIdentifier = date |> formatOption
        let amountIdentifier = amount |> formatOption
        let providerIdentifier = getReceiptProvider provider |> formatOption

        let identifier = userIdentifier + dateIdentifier + amountIdentifier + providerIdentifier
        identifier.Substring(0, identifier.Length - 1) |> Some


    let generateTransactionUniqueId (userId: int) (registrationDate: DateTime option) (completitonDate: DateTime option) 
        (amount: double option) (index: int) (provider: TransactionProvider option) (referenceId: int option) =
        let userIdentifier = string userId |> format
        let registrationIdentifier = registrationDate |> formatOption
        let completitonIdentifier = completitonDate |> formatOption
        let amountIdentifier = amount |> formatOption
        let indexIdentifier = string (index + 1) |> format
        let referenceIdentifier = referenceId |> formatOption
        let providerIdentifier = getTransactionProvider provider |> formatOption

        let identifier = userIdentifier + registrationIdentifier + completitonIdentifier + amountIdentifier + indexIdentifier + referenceIdentifier + providerIdentifier 
        identifier.Substring(0, identifier.Length - 1) |> Some


    let mapTransactions (transaction: ParsedTransaction list) userId: ParsedTransaction list =
        transaction
        |> List.indexed
        |> List.map(fun (i, rpt)-> 
            {   
                Identifier = generateTransactionUniqueId userId rpt.RegistrationDate rpt.CompletionDate rpt.Amount i rpt.Provider rpt.ReferenceId
                RegistrationDate = rpt.RegistrationDate
                CompletionDate = rpt.CompletionDate
                Amount = rpt.Amount
                Fee = rpt.Fee
                Description = rpt.Description
                TransactionType = rpt.TransactionType
                Currency = rpt.Currency
                Status = rpt.Status
                Provider = rpt.Provider
                ReferenceId = rpt.ReferenceId
            }
        )

