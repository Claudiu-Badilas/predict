namespace DataAnalysis.Utils

open DataAnalysis.Types.ParsersTypes
open System

module ParserUtils =

    let getCurrency value =
        match value with
        | "RON" -> CurrencyType.RON |> Some
        | "EUR" -> CurrencyType.EUR |> Some
        | "USD" -> CurrencyType.USD |> Some
        | _ -> None
        

    let getProviderCalculationConstant provider =
        match provider with
        | Provider.Raiffeisen -> 9234236632.4
        | Provider.Revolut -> 23247364.3
        | Provider.OrangeMoney -> 65983543.23


    let generateUniqueGuid (registrationDate: DateTime option) (completitonDate: DateTime option) (amount: double option) (index: int) provider: Guid option =
        let providerConstant = getProviderCalculationConstant provider
        let validAmount =
            match amount with
            | Some 0.0 -> 694587965.34
            | _ -> amount.Value
        let constant = Double.Parse(((double index + 1.21487) * 987_654_321.13821).ToString())
        
        match registrationDate, completitonDate with 
        | Some registrationDate, Some completitonDate -> 
            let bytes = BitConverter.GetBytes(registrationDate.Ticks * completitonDate.Ticks * int64 validAmount)
            let bytes2 = BitConverter.GetBytes(validAmount * providerConstant * constant * 55_123_456_789.52325)
            new Guid(Array.append bytes bytes2) |> Some
        | _, _ -> None

