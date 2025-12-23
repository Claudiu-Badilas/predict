namespace Predict.Utils

open System
open iTextSharp.text.pdf
open iTextSharp.text.pdf.parser

module PdfUtils =
    
    let getTextFromPdf (pdf: PdfReader): string =
        let mutable pages: string list = [] 
        for i in 1 .. pdf.NumberOfPages do
            let page = PdfTextExtractor.GetTextFromPage(pdf, i)
            if not (String.IsNullOrEmpty(page)) then pages <- page::pages
        List.fold (fun acc x -> acc + " " + x) "" (pages |> List.rev)


