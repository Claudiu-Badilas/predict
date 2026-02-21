namespace Predict.Reader.MortgageLoan.BCR

open System
open Predict.Reader.Common.Utils
open iTextSharp.text.pdf
open System.IO
open System.Globalization
open Predict.Reader.MortgageLoan.BCR.Types.BCRMortgageLoanTypes

module BCRMortgageLoadn =

    let getLocalPdfs path =
        Directory.EnumerateFiles(path, "*.pdf")
        |> Seq.toArray
        |> Array.map (fun f -> (Path.GetFileNameWithoutExtension(f), new PdfReader(f)))


    let tryGetDouble (value: string option) =
        match value with
        | Some v ->
            let culture = CultureInfo("de-DE")
            let ok, dv = Double.TryParse(v, NumberStyles.Number, culture)
            if ok then Some dv else None
        | None -> None


    let tryGetInt (value: string option) =
        match value with
        | Some v ->
            let culture = CultureInfo("de-DE")
            let ok, iv = Int32.TryParse(v, NumberStyles.Integer, culture)
            if ok then Some iv else None
        | None -> None


    let tryGetDate (value: string option) =
        match value with
        | Some v ->
            let format = "yyyy-MM-dd"
            let culture = CultureInfo.InvariantCulture
            let ok, dt = DateTime.TryParseExact(v, format, culture, DateTimeStyles.None)
            if ok then Some dt else None
        | None -> None


    let getMortgageDetails (pdf: PdfReader) : Instalment list =
        let text = PdfUtils.getTextFromPdf pdf

        let pages =
            text.Split(
                "Nr. Data plății Rată Credit Rată Comision de Costuri de Comision de Dobânda Total rată Sold (rest de"
            )
            |> Array.skip (1)
            |> Array.map (fun p ->
                p.Replace(
                    "\nCrt. Dobândă administrare asigurare gestiune regularizată/ de plătit plată)\nrecalculată\n",
                    ""
                ))

        let allRows = ((String.concat "" pages).Split("Total")[0]).Split("\n")

        let rate =
            Array.take (allRows.Length - 1) allRows
            |> Array.map (fun row ->
                let cells = row.Split(" ")

                { InstalmentId = cells[0] |> Some |> tryGetInt
                  PaymentDate = cells[1] |> Some |> tryGetDate
                  PrincipalAmount = cells[2] |> Some |> tryGetDouble
                  InterestAmount = cells[3] |> Some |> tryGetDouble
                  AdministrationFee = cells[4] |> Some |> tryGetDouble
                  InsuranceCost = cells[5] |> Some |> tryGetDouble
                  ManagementFee = cells[6] |> Some |> tryGetDouble
                  RecalculatedInterest = cells[7] |> Some |> tryGetDouble
                  TotalInstalment = cells[8] |> Some |> tryGetDouble
                  RemainingBalance = cells[9] |> Some |> tryGetDouble })
            |> Array.toList

        rate

    let loadMortgages path =
        getLocalPdfs path
        |> Array.Parallel.map (fun (fileName, pdf) ->
            { defaultGraficRambursare with
                Name = fileName
                MonthlyInstalments = getMortgageDetails pdf
                Date = DateTime.ParseExact(fileName, "dd-MMM-yyyy", CultureInfo.InvariantCulture) })
        |> Array.toList

    let getBcrMorgages () =
        let basePath = @"D:\Projects\PredictFiles\Morgages\BCR"

        let basePayments =
            loadMortgages $"{basePath}\BasePayment"
            |> List.map (fun file -> { file with IsBasePayment = true })

        let normalPayments =
            loadMortgages $"{basePath}\NormalPayment"
            |> List.map (fun file -> { file with IsNormalPayment = true })

        let extraPayments =
            loadMortgages $"{basePath}\ExtraPayment"
            |> List.map (fun file -> { file with IsExtraPayment = true })

        basePayments @ normalPayments @ extraPayments |> List.sortByDescending _.Date
