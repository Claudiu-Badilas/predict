namespace Predict.Utils

open Predict.Types.TransactionTypes
open Predict.Types.CommonTypes
open System
open System.Globalization
open Predict.Types.ReceiptTypes

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
        

    let getProvider provider =
        match provider with
        | Some Provider.RAIFFEISEN -> "RAIFFEISEN" |> Some
        | Some Provider.REVOLUT -> "REVOLUT" |> Some
        | Some Provider.ORANGE_MONEY -> "ORANGE_MONEY" |> Some
        | Some Provider.CARREFOUR -> "CARREFOUR" |> Some
        | Some Provider.KAUFLAND -> "KAUFLAND" |> Some
        | _ -> "" |> Some


    let format value = "[" + value + "]@"


    let formatOption value =
        match value with
        | Some value -> string value |> format
        | _ -> "" |> format


    let generateReceiptUniqueId (userId: int) (date: DateTime option) (amount: double option) (provider: Provider option) =
        let userIdentifier = string userId |> format
        let dateIdentifier = date |> formatOption
        let amountIdentifier = amount |> formatOption
        let providerIdentifier = getProvider provider |> formatOption

        let identifier = userIdentifier + dateIdentifier + amountIdentifier + providerIdentifier
        identifier.Substring(0, identifier.Length - 1) |> Some


    let generateTransactionUniqueId (userId: int) (registrationDate: DateTime option) (completitonDate: DateTime option) 
        (amount: double option) (index: int) (provider: Provider option) (referenceId: int option) =
        let userIdentifier = string userId |> format
        let registrationIdentifier = registrationDate |> formatOption
        let completitonIdentifier = completitonDate |> formatOption
        let amountIdentifier = amount |> formatOption
        let indexIdentifier = string (index + 1) |> format
        let referenceIdentifier = referenceId |> formatOption
        let providerIdentifier = getProvider provider |> formatOption

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
                Provider = rpt.Provider
                ReferenceId = rpt.ReferenceId
            }
        )

