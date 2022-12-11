namespace DataAnalysis.Utils

open DataAnalysis.Types.ParsersTypes
open System
open System.Globalization

module ParserUtils =

    let tryGetInt (value: string option) =
        match value with
        | Some value -> 
            let isValid, intValue = Int32.TryParse(value, NumberStyles.Any, CultureInfo.InvariantCulture)
            match isValid with
            | true -> intValue |> Some
            | _ -> None
        | _ -> None


    let tryGetFloat (value: string option) =
        match value with
        | Some value -> 
            let isValid, doubleValue = Double.TryParse(value, NumberStyles.Any, CultureInfo.InvariantCulture)
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
        

    let getProviderCalculationConstant provider =
        match provider with
        | Provider.RAIFFEISEN -> 9234236632.4
        | Provider.REVOLUT -> 23247364.3
        | Provider.ORANGE_MONEY -> 65983543.23


    let generateUniqueGuid userId (registrationDate: DateTime option) (completitonDate: DateTime option) (amount: double option) (index: int) provider: Guid option =
        let providerConstant = getProviderCalculationConstant provider
        let validAmount =
            match amount.IsSome with
            | true -> amount.Value * (double userId)
            | _ -> 694587965.34 * (double userId)
        let constant = Double.Parse(((double index + 1.21487) * 987_654_321.13821).ToString())
        
        match registrationDate, completitonDate with 
        | Some registrationDate, Some completitonDate -> 
            let bytes = BitConverter.GetBytes(registrationDate.Ticks * completitonDate.Ticks * int64 validAmount)
            let bytes2 = BitConverter.GetBytes(validAmount * providerConstant * constant * 55_123_456_789.52325)
            new Guid(Array.append bytes bytes2) |> Some
        | _, _ -> None

