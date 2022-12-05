namespace DataAnalysis.Utils

open System
open System.Globalization

module DateTimeUtils =
    

    let convertStringToUTCDate (date: string option) (pattern: string): DateTime option =
        match date with
        | Some value -> Some (DateTime.ParseExact(value, pattern, CultureInfo.InvariantCulture).ToUniversalTime())
        | _ -> None

