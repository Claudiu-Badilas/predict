namespace DataAnalysis.Parsers.OMParsers

open System
open DataAnalysis.Types.ParsersTypes
open DataAnalysis.Utils
open System.Text.RegularExpressions
open DataAnalysis.DatabaseAccess
open iTextSharp.text.pdf
open iTextSharp.text.pdf.parser

module ParserOrangeMoneyPdfAccountStatement =

    let DATE_REGEX = @"\d{2}\.\d{2}\.\d{4}";
    
    let getTranasctionType (value: string) = 
        match value.Trim() with
        |  "Bonus Orange Money, Bonus client" -> TransactionType.REWARD |> Some
        |  "Plata comerciant" -> TransactionType.CARD_PAYMENT |> Some
        |  "Plata factura" -> TransactionType.BILL_PAYMENT |> Some
        |  "Reîncărcare PrePay Orange" -> TransactionType.BILL_PAYMENT |> Some
        |  "Alimentare cu cardul" -> TransactionType.TOP_UP |> Some
        |  "Retragere numerar la ATM" -> TransactionType.ATM |> Some
        |  "Transfer bani" -> TransactionType.INTERNAL_TRANSFER |> Some
        |  "Transfer" -> TransactionType.INTERNAL_TRANSFER |> Some
        |  _ -> TransactionType.CARD_PAYMENT |> Some

            
    let getFirstRowDescription (line: string) =
        let words = line.Split(" ")
        let firstRowDesc =
            words
            |> Seq.toList
            |> List.indexed
            |> List.map(fun (i, _) ->
                let filteredWords = 
                    words
                    |> Array.indexed
                    |> Array.filter (fun (i,_) -> i <> words.Length - 1)
                    |> Array.filter (fun (i,_) -> i <> words.Length - 2)
                    |> Array.filter (fun (i,_) -> i <> 0)
                    |> Array.filter (fun (i,_) -> i <> 1)
                    |> Array.filter (fun (i,_) -> i <> 2)
                    |> Array.map(fun (_, w) -> w + " ")
                    |> Array.fold (+) ""
                filteredWords
            )
        firstRowDesc[0]

    let getDescription (lines: string []) (index: int) = 
        lines
        |> Seq.toList
        |> List.indexed
        |> List.map(fun (i, line) ->
            if i >= index then
                if i = index then 
                    getFirstRowDescription line + " "
                else line  + " "
            else ""
        )
        |> List.fold (+) ""


    let getTransactions (pdf: PdfReader) userId: ParsedTransaction list =
        let mutable pages: string list = [] 
        for i in 1 .. pdf.NumberOfPages do
            pages <- PdfTextExtractor.GetTextFromPage(pdf, i)::pages
        pages
        |> List.map(fun page -> 
            let groups = page.Split([| "\n\n" |], StringSplitOptions.None)
            let filteredGroups = 
                groups
                |> Array.indexed
                |> Array.filter (fun (i, _) -> i <> groups.Length - 1)
                |> Array.map(fun (_, g) -> g)
            let lines = filteredGroups[0].Split("\n")
            let validGroups =
                lines
                |> Array.indexed
                |> Array.map(fun (i, line) -> Regex.IsMatch(line.Split(" ")[0], DATE_REGEX), line)
                |> Array.map(fun (cond, line) -> if cond then line else null)
                |> Array.filter(fun line -> not (line = null))
            
            let allGroups =
                filteredGroups
                |> Array.indexed
                |> Array.filter (fun (i, _) -> i <> 0)
                |> Array.map(fun (_, g) -> g)
                |> Array.append(validGroups)
            allGroups
            |> Array.map(fun group ->
                let lines = group.Split("\n")
                lines
                |> Array.indexed
                |> Array.map(fun (i, line) -> 
                    let words = line.Split(" ")
                    let date = words[0]
                    match date with
                    | null -> None
                    | _ -> 
                        match Regex.IsMatch(date, DATE_REGEX) with
                        | false -> None
                        | _ -> 
                            let amount = words[words.Length - 2] |> Some |> ParserUtils.tryGetDouble
                            Some {
                                Id = None
                                RegistrationDate = DateTimeUtils.convertStringToUTCDate (date |> Some) "dd.MM.yyyy"
                                CompletionDate = DateTimeUtils.convertStringToUTCDate (words[1] |> Some) "dd.MM.yyyy"
                                Amount = amount
                                Fee = None
                                Currency = CurrencyType.RON |> Some
                                Description = getDescription lines i |> Some
                                TransactionType = getFirstRowDescription line |> getTranasctionType
                                Status = TransactionStatus.COMPLETED |> Some
                                ReferenceId = words[2] |> Some |> ParserUtils.tryGetInt
                                Provider = Provider.ORANGE_MONEY |> Some
                            }
                )
            )
            |> Array.concat
        )
        |> Array.concat
        |> Array.toList
        |> List.filter (fun d -> d.IsSome)
        |> List.choose(fun t -> t)
        |> List.groupBy(fun t -> t.RegistrationDate, t.Amount)
        |> List.map(fun (_, t) -> ParserUtils.mapTransactions t userId )
        |> List.concat
        |> List.distinctBy(fun t -> t.Id)


    let parsePdfs userId (pdfs: PdfReader list) =
        let parsedTransaction =
            pdfs 
            |> List.toArray
            |> Array.chunkBySize 100
            |> Array.Parallel.map (fun chunk ->
                chunk 
                |> Array.toList
                |> List.map(fun pdf -> getTransactions pdf userId)
                |> List.concat
            )
            |> List.concat
            |> List.distinctBy(fun t -> t.Id)

        StoreTransactions.storeTransaction userId parsedTransaction


