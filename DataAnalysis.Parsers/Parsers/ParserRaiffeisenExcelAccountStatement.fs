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
        | _ , Some (0.0), true -> Some TransactionType.Spend
        | Some (0.0), _, true -> Some TransactionType.Received
        | _ , _, false -> Some TransactionType.InternalTransfer
        | None, None, _ -> None
        | _, _, _ -> None
            

    let getDescription (description: string ): string option = 
        let splitedDescription = checkDescriptionByText description "Transfer intre conturi proprii"

        match splitedDescription.IsEmpty with
        | true -> Some (description.Split("|")[0])
        | false -> Some (description.Split("|")[1])


    let mapTransactions (transaction: RawRevolutParsedTransaction list): RevolutParsedTransaction list =
        transaction
        |> List.indexed
        |> List.map(fun (i, rpt)-> 
            {   
                Id = ParserUtils.generateUniqueGuid rpt.RegistrationDate rpt.Amount i
                RegistrationDate = rpt.RegistrationDate
                CompletionDate = rpt.CompletionDate
                Amount = rpt.Amount
                Fee = rpt.Fee
                Description = rpt.Description
                TransactionType = rpt.TransactionType
                Currency = rpt.Currency
                Status = rpt.Status
            }
        )

    let getAmount debit credit =
        match debit, credit with
        | Some debit, Some 0.0 -> Some (debit * -1.0)
        | Some 0.0, Some credit -> Some credit
        | _, _-> None


    let getTransactions (excel: WorkBook): RevolutParsedTransaction list =
        excel.DefaultWorkSheet.Rows
        |> Seq.toList
        |> List.map (fun row ->
            let date = row.ElementAtOrDefault(0).ToString()
            match date with
            | null -> None
            | _ -> 
                match Regex.IsMatch(date, DATE_REGEX) with
                | false -> None
                | _ -> 
                    let debit = Some (row.Columns.ElementAtOrDefault(2).DoubleValue)
                    let credit = Some (row.Columns.ElementAtOrDefault(3).DoubleValue)
                    let description = row.Columns.LastOrDefault().ToString()
                    let registrationDate = DateTimeUtils.convertStringToUTCDate (Some date) "dd/MM/yyyy"
                    Some {
                        RegistrationDate = registrationDate
                        CompletionDate = DateTimeUtils.convertStringToUTCDate (Some (row.ElementAtOrDefault(1).ToString())) "dd/MM/yyyy"
                        Amount = getAmount debit credit
                        Fee = None
                        Currency = Some CurrencyType.RON
                        Description = getDescription description
                        TransactionType = getTranasctionType debit credit description
                        Status = Some TransactionStatus.Completed
                    }
        )
        |> List.filter (fun d -> d.IsSome)
        |> List.choose(fun t -> t)
        |> List.groupBy(fun t -> t.RegistrationDate, t.Amount)
        |> List.map(fun (_, t) -> mapTransactions t )
        |> List.concat
        |> List.distinctBy(fun t -> t.Id)


    let parseRaiffExcels (excels: WorkBook list): RevolutParsedTransaction list =
        excels 
        |> List.choose(fun excel -> Some excel)
        |> List.toArray
        |> Array.chunkBySize 100
        |> Array.Parallel.map (fun chunk ->
            chunk 
            |> Array.toList
            |> List.map(fun excel -> getTransactions excel)
            |> List.concat
        )
        |> List.concat

