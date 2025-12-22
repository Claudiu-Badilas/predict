namespace DataAnalysis.Parsers.ReceiptParser

open System
open DataAnalysis.Utils
open iTextSharp.text.pdf
open DataAnalysis.Utils.ParserUtils
open System.IO
open System
open System.Globalization
open DataAnalysis.Types.MortgageTypes

module BCRMortgageMapper =

    let getLocalPdfs path =
        Directory.EnumerateFiles(path, "*.pdf")
        |> Seq.toArray
        |> Array.map (fun f ->
            (Path.GetFileNameWithoutExtension(f), new PdfReader(f))
        )


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


    let getMorgageDetails (pdf: PdfReader): Rata list =
        let text = PdfUtils.getTextFromPdf pdf
        let pages = 
            text.Split("Nr. Data plății Rată Credit Rată Comision de Costuri de Comision de Dobânda Total rată Sold (rest de")
            |> Array.skip(1)
            |> Array.map(fun p -> p.Replace("\nCrt. Dobândă administrare asigurare gestiune regularizată/ de plătit plată)\nrecalculată\n", ""))            

        let allRows = 
            ((String.concat "" pages).Split("Total")[0]).Split("\n")

        let rate = 
            Array.take (allRows.Length - 1) allRows
            |> Array.map(fun row -> 
                let cells = row.Split(" ")
                {
                    NrCtr = cells[0] |> Some |> tryGetInt
                    DataPlatii = cells[1] |> Some |> tryGetDate
                    RataCredit = cells[2] |> Some |> tryGetDouble
                    RataDobanda = cells[3] |> Some |> tryGetDouble
                    ComisionAdministrare = cells[4] |> Some |> tryGetDouble
                    CosturuAsigurare = cells[5] |> Some |> tryGetDouble
                    ComisionGestiune = cells[6] |> Some |> tryGetDouble
                    DobadaRecalculata = cells[7] |> Some |> tryGetDouble
                    TotalRata = cells[8] |> Some |> tryGetDouble
                    SoldRestPlata = cells[9] |> Some |> tryGetDouble
                }
            )
            |> Array.toList

        rate
 

    let getBcrMorgages () =
        getLocalPdfs @"C:\Users\Claudiu\IdeaProjects\Projects\DataAnalysisFiles\Morgages\BCR"
        |> Array.Parallel.map (fun (fileName, pdf) ->
            {
                Name = fileName
                Rate = getMorgageDetails pdf
            }
        )
        |> Array.toList