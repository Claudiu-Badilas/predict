namespace DataAnalysis.Parsers

open IronXL
open System.Linq
open System.Text.RegularExpressions
open System
open DataAnalysis.Types.ParsersTypes
open DataAnalysis.Utils

module ParserRaiffeisenExcelAccountStatement =

    let DATE_REGEX = @"^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$";


    let checkDescriptionByText (description: string ) (text: string): string list=
        description.Split("|")
        |> Array.toList
        |> List.filter(fun d -> d.Contains(text))

    
    let getTranasctionType (debit: double option) (credit: double option) (description: string ): TransactionType option = 
        let splitedDescription = checkDescriptionByText description "Transfer intre conturi proprii"

        match debit, credit, splitedDescription.IsEmpty with
        | Some d , None, true -> Some TransactionType.SPEND
        | None, Some c, true -> Some TransactionType.RECEIVED
        | _ , _, false -> Some TransactionType.INTERNAL_TRANSFER
        | _, _, _ -> None
            

    let getDescription (description: string ): string option = 
        let splitedDescription = checkDescriptionByText description "Transfer intre conturi proprii"

        match splitedDescription.IsEmpty with
        | true -> description.Split("|")[0] |> Some
        | false -> description.Split("|")[1] |> Some


    let mapTransactions (transaction: RawParsedTransaction list) userId: ParsedTransaction list =
        transaction
        |> List.indexed
        |> List.map(fun (i, rpt)-> 
            let provider = Provider.RAIFFEISEN
            {   
                Id = ParserUtils.generateUniqueGuid userId rpt.RegistrationDate rpt.CompletionDate rpt.Amount i provider
                RegistrationDate = rpt.RegistrationDate
                CompletionDate = rpt.CompletionDate
                Amount = rpt.Amount
                Fee = rpt.Fee
                Description = rpt.Description
                TransactionType = rpt.TransactionType
                Currency = rpt.Currency
                Status = rpt.Status
                Provider = provider |> Some
            }
        )

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
                    let debit = row[2] |> Some |> ParserUtils.tryGetFloat
                    let credit = row[3] |> Some |> ParserUtils.tryGetFloat
                    let description = row[11]
                    let registrationDate = DateTimeUtils.convertStringToUTCDate (date |> Some) "dd/MM/yyyy"
                    Some {
                        RegistrationDate = registrationDate
                        CompletionDate = DateTimeUtils.convertStringToUTCDate (row[1] |> Some) "dd/MM/yyyy"
                        Amount = getAmount debit credit
                        Fee = None
                        Currency = CurrencyType.RON |> Some
                        Description = getDescription description
                        TransactionType = getTranasctionType debit credit description
                        Status = TransactionStatus.COMPLETED |> Some
                    }
        )
        |> List.filter (fun d -> d.IsSome)
        |> List.choose(fun t -> t)
        |> List.groupBy(fun t -> t.RegistrationDate, t.Amount)
        |> List.map(fun (_, t) -> mapTransactions t userId )
        |> List.concat
        |> List.distinctBy(fun t -> t.Id)


    let parseExcels userId (excels: WorkBook list): ParsedTransaction list =
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

