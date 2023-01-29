namespace DataAnalysis.Parsers.ReceiptParser

open System
open DataAnalysis.Types.ReceiptTypes
open DataAnalysis.Utils
open System.Text.RegularExpressions
open iTextSharp.text.pdf
open DataAnalysis.Types.CommonTypes
open DataAnalysis.Utils.ParserUtils

module ParserCarrefourPdfReceipt =
        
    let getQuantyType quantityType =
        match quantityType with
        | "buc" -> QuantityType.BUC |> Some
        | "kg" -> QuantityType.KG |> Some
        | _ -> None


    let popLastElementOfList list =
        let popped = List.last list
        let newList = List.take (List.length list - 1) list
        popped, newList


    let getValue text value =
        let result = Regex.Match(text, "(" + value + ")[\s]*(.*)")
        match Seq.length result.Groups with
        | 3 -> (result.Groups[Seq.length result.Groups - 1]).Value |> Some
        | _ -> None


    let getParsedProducts (text: string) =
        let lines = text.Split([| "\n" |], StringSplitOptions.None)
        lines
        |> Array.indexed
        |> Array.map(fun (i, line) -> 
            let result = Regex.Match(line.Trim(), "([0-9.]+)( |)([buckg]+)( x |)([0-9.]+)")
            match result.Success && Seq.length result.Groups = 6 with
            | true ->
                let nextLine = 
                    if (i + 1) < lines.Length then lines[i + 1]
                    else ""
                let words = nextLine.Trim().Split(" ") |> Array.toList
                let vatType, words = popLastElementOfList words
                let vat = 
                    getValue text ("TVA " + vatType) 
                    |> Option.bind(fun v -> 
                        let percentValue = v.Split(" ")[0]
                        percentValue.Substring(0, percentValue.Length - 1) |> Some )
                    |> ParserUtils.tryGetDouble
                let price, words = popLastElementOfList words
                Some {
                    Name = List.fold (fun acc x -> acc + " " + x) "" words |> Some
                    Quanty = result.Groups[1].Value |> Some |> ParserUtils.tryGetDouble
                    QuantityType = result.Groups[3].Value |> getQuantyType
                    VAT = vat
                    Price = price |> Some |> ParserUtils.tryGetDouble
                }
            | _ -> None
        )
        |> Array.filter(fun p -> p.IsSome)
        |> Array.toList


    let getReceipt (pdf: PdfReader) userId: ParsedReceipt =
        let text = PdfUtils.getTextFromPdf pdf
        let products = getParsedProducts text
        let dateAndTime = getValue text "Data:" |> Option.bind(fun v -> v.Trim().Split("ORA:") |> Some)
        let dateTime =  DateTimeUtils.convertStringToUTCDate (dateAndTime.Value[0].Trim() + " " + dateAndTime.Value[1].Trim() |> Some) "dd/MM/yyyy HH-mm-ss"
        let provider = Provider.CARREFOUR  |> Some
        let total = getValue text "SUBTOTAL" |> ParserUtils.tryGetDouble
        {
            Identifier = generateReceiptUniqueId userId dateTime total provider
            Date = dateTime
            TotalPrice = total
            TotalDiscount = getValue text "DISCOUNT:" |> Option.bind(fun v -> v.Substring(0, v.Length - 2) |> Some) |> ParserUtils.tryGetDouble
            Currency = CurrencyType.RON |> Some
            ParsedProducts = products
            Provider = provider
        }
    
    
    let parsePdfs userId (pdfs: PdfReader list) =
        let parsedTransaction =
            pdfs 
            |> List.map(fun pdf -> getReceipt pdf userId)
            |> List.distinctBy(fun t -> t.Identifier)

        parsedTransaction


