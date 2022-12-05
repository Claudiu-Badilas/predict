namespace DataAnalysis.Utils

open DataAnalysis.Types.ParsersTypes
open System

module ParserUtils =

    let getCurrency value =
        match value with
        | "RON" -> Some CurrencyType.RON
        | "EUR" -> Some CurrencyType.EUR
        | "USD" -> Some CurrencyType.USD
        | _ -> None


    let generateUniqueGuid (date: DateTime option) (amount: double option) (index: int): Guid option =
        match date, amount with 
        | Some date, Some amount -> 
            let bytes = BitConverter.GetBytes(date.Ticks)
            let constant = Double.Parse(((double index + 1.21487) * 987_654_321.13821).ToString())
            let bytes2 = BitConverter.GetBytes(amount * constant * 55_123_456_789.52325)
            Some (new Guid(Array.append bytes bytes2))
        | _, _ -> None

