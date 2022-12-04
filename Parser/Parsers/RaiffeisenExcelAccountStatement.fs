namespace DataAnalysis.Parsers

open IronXL
open System.Linq
open System.Text.RegularExpressions
open System
open System.Globalization
open DataAnalysis.Types.ParsersTypes

module RaiffeisenExcelAccountStatement =

    let DATE_REGEX = @"^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$";


    let convertStringToUTCDate (date: string option): DateTime option =
        match date with
        | Some value -> Some (DateTime.ParseExact(value, "dd/MM/yyyy", CultureInfo.InvariantCulture).ToUniversalTime())
        | _ -> None


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


    let generateUniqueGuid (date: DateTime option) (debit: double option) (credit: double option) (transactionNo: int): Guid option =
        match date with 
        | Some value-> 
            let bytes = BitConverter.GetBytes(value.Ticks)
            let constant = Double.Parse((transactionNo * 987_654_321).ToString())
            let bytes2 = 
                match debit, credit with 
                | Some debit, Some 0.0 -> BitConverter.GetBytes((debit + constant) * -55_123_456_789.555)
                | Some 0.0, Some credit -> BitConverter.GetBytes((credit + constant) * 55_123_456_789.555)
                | _, _ -> [||]
            Some (new Guid(Array.append bytes bytes2))
        | None -> None


    let mapTransactions (transaction: RawParsedTransaction list): ParsedTransaction list =
        transaction
        |> List.indexed
        |> List.map(fun (i, rpt)-> 
            {   
                Id = generateUniqueGuid rpt.RegistrationDate rpt.DebitAmount rpt.CreditAmount i
                RegistrationDate = rpt.RegistrationDate
                TransactionDate = rpt.TransactionDate
                DebitAmount = rpt.DebitAmount
                CreditAmount = rpt.CreditAmount
                Description = rpt.Description
                TransactionType = rpt.TransactionType
            }
        )


    let getTransactions (excel: WorkBook): ParsedTransaction list =
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
                    let registrationDate = convertStringToUTCDate (Some date)
                    Some {
                        RegistrationDate = registrationDate
                        TransactionDate = convertStringToUTCDate (Some (row.ElementAtOrDefault(1).ToString()))
                        DebitAmount = debit
                        CreditAmount = credit
                        Description = getDescription description
                        TransactionType = getTranasctionType debit credit description
                    }
        )
        |> List.filter (fun d -> d.IsSome)
        |> List.choose(fun t -> t)
        |> List.groupBy(fun t -> t.RegistrationDate, t.DebitAmount, t.CreditAmount)
        |> List.map(fun (_, t) -> mapTransactions t )
        |> List.concat
        |> List.distinctBy(fun t -> t.Id)


    let parseRaiffExcels (excels: WorkBook list): ParsedTransaction list =
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

