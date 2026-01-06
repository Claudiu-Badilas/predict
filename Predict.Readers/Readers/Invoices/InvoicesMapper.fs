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


    let tryGetDate (value: string option) =
        value
        |> Option.bind (fun v ->
            let format = "M/d/yyyy h:mm:ss tt"
            let culture = CultureInfo.InvariantCulture
            match DateTime.TryParseExact(v, format, culture, DateTimeStyles.None) with
            | true, dt -> Some dt
            | _ -> None
        )


    let getInvoiceDetails (fileName, workbook: WorkBook) : LocationInvoice =
        ExcelUtils.getExcelSheetValues workbook
        |> Array.collect (fun (sheetName, rows) ->
            rows
            |> Array.skip 1
            |> Array.map (fun row ->
                {
                    Type = Some sheetName
                    Provider = Some row.[0]
                    Date = tryGetDate (Some row.[1])
                    Index = tryGetDouble (Some row.[2])
                    Amount = tryGetDouble (Some row.[3])
                }
            )
        )
        |> fun invoices -> { Address = Some fileName; Invoices = invoices |> Array.toList }


    let getInvoices () =
        let path = @"D:\Projects\PredictFiles\Invoices"
        getLocalExcels path |> List.map(fun x -> getInvoiceDetails x)
