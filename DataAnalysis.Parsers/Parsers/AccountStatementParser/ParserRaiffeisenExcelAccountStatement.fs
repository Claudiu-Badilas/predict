namespace DataAnalysis.Parsers.AccountStatementParser

open IronXL
open System.Linq
open System.Text.RegularExpressions
open System
open DataAnalysis.Types.ParsersTypes
open DataAnalysis.Utils
open DataAnalysis.DatabaseAccess

module ParserRaiffeisenExcelAccountStatement =

    let DATE_REGEX = @"^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$";


    let checkDescriptionByText (description: string ) (text: string): string list=
        description.Split("|")
        |> Array.toList
        |> List.filter(fun d -> d.Contains(text))

    
    let getTranasctionType (debit: double option) (credit: double option) (description: string ): TransactionType option = 
        let splitedDescription = checkDescriptionByText description "Transfer intre conturi proprii"

        match debit, credit, splitedDescription.IsEmpty with
        | Some d, None, true -> TransactionType.SPEND |> Some
        | None, Some c, true -> TransactionType.RECEIVED |> Some
        | _ , _, false -> TransactionType.INTERNAL_TRANSFER |> Some
        | _, _, _ -> None
            

    let getDescription (description: string ): string option = 
        let splitedDescription = checkDescriptionByText description "Transfer intre conturi proprii"

        match splitedDescription.IsEmpty with
        | true -> description.Split("|")[0] |> Some
        | false -> description.Split("|")[1] |> Some


    let getAmount debit credit =
        match debit, credit with
        | Some debit, None -> debit * -1.0 |> Some
        | None, Some credit -> credit |> Some
        | _, _-> None


    let getTransactions (excel: WorkBook) userId: ParsedTransaction list =
        ExcelUtils.getExcelValues excel
        |> Seq.toList
        |> List.indexed
        |> List.map (fun (i, row) ->
            let date = row[0]
            match date with
            | null -> None
            | _ -> 
                match Regex.IsMatch(date, DATE_REGEX) with
                | false -> None
                | _ -> 
                    let debit = row[2] |> Some |> ParserUtils.tryGetDouble
                    let credit = row[3] |> Some |> ParserUtils.tryGetDouble
                    let description = row[11]
                    let registrationDate = DateTimeUtils.convertStringToUTCDate (date |> Some) "dd/MM/yyyy"
                    Some {
                        Id = None
                        RegistrationDate = registrationDate
                        CompletionDate = DateTimeUtils.convertStringToUTCDate (row[1] |> Some) "dd/MM/yyyy"
                        Amount = getAmount debit credit
                        Fee = None
                        Currency = CurrencyType.RON |> Some
                        Description = getDescription description
                        TransactionType = getTranasctionType debit credit description
                        Status = TransactionStatus.COMPLETED |> Some
                        ReferenceId = None
                        Provider = Provider.RAIFFEISEN |> Some
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

