namespace Predict.Reader.Mortgage

open System
open System.IO
open System.Globalization
open IronXL
open Predict.Types.InvoiceTypes
open Predict.Utils

module InvoicesMapper =

    let getLocalExcels (path: string) =
        let excelFiles = 
            Directory.EnumerateFiles(path, "*.xlsx")
            |> Seq.append (Directory.EnumerateFiles(path, "*.xls"))
            |> Seq.toList
        excelFiles
        |> List.choose (fun f ->
            try 
                Some(Path.GetFileNameWithoutExtension(f), WorkBook.Load(f))
            with
            | _ -> None 
        )


    let tryGetDouble (value: string option) =
        value
        |> Option.bind (fun v ->
            let culture = CultureInfo("de-DE")
            match Double.TryParse(v, NumberStyles.Number, culture) with
            | true, dv -> Some dv
            | _ -> None
        )


    let tryGetDate (value: string option) (format: string) =
        value
        |> Option.bind (fun v ->
            let culture = CultureInfo.InvariantCulture
            match DateTime.TryParseExact(v, format, culture, DateTimeStyles.None) with
            | true, dt -> Some dt
            | _ -> None
        )


    let tryGetDateFallback (value: string option) =
        let date1 = tryGetDate value  "dd/MM/yyyy"
        let date2 = tryGetDate value  "d/M/yyyy"
        match date1, date2 with
        | Some dt1, Some dt2 -> Some dt1
        | Some dt1, None -> Some dt1
        | None, Some dt2 -> Some dt2
        | _ -> None
        


    let getInvoiceDetails (fileName, workbook: WorkBook) : LocationInvoice =
        ExcelUtils.getExcelSheetValues workbook
        |> Array.collect (fun (sheetName, rows) ->
            rows
            |> Array.skip 1
            |> Array.map (fun row ->
                {
                    InvoiceType = Some sheetName
                    Provider = Some row.[0]
                    Date = tryGetDateFallback (Some row.[1])
                    Index = tryGetDouble (Some row.[2])
                    Amount = tryGetDouble (Some row.[3])
                    Type = Some row.[4]
                    Action = Some row.[5]
                }
            )
        )
        |> fun invoices -> { Address = Some fileName; Invoices = invoices |> Array.toList }


    let getInvoices () =
        let path = @"D:\Projects\PredictFiles\Invoices"
        getLocalExcels path |> List.map(fun x -> getInvoiceDetails x)
