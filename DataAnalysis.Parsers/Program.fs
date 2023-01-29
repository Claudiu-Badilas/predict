open System.IO
open IronXL
open DataAnalysis.Parsers
open iTextSharp.text.pdf
open System
open DataAnalysis.Parsers.OMParsers
open DataAnalysis.Parsers.OMParsers.AccountStatementParser
open DataAnalysis.Parsers.AccountStatementParser
open DataAnalysis.Parsers.ReceiptParser

module ParserConsole =

    let getLocalExcels path =
        Directory.EnumerateFiles(path, "*.xlsx")
        |> Seq.toList 
        |> List.map(fun f -> Path.Combine(path, f) |> WorkBook.Load)


    let getLocalPdfs path =
        Directory.EnumerateFiles(path, "*.pdf")
        |> Seq.toList 
        |> List.map(fun f -> new PdfReader(Path.Combine(path, f)))


    [<EntryPoint>]
    let main _ =
        let userId = 1

        //let raifExcels = getLocalExcels @""
        //let raitransactions = ParserRaiffeisenExcelAccountStatement.parseExcels userId raifExcels

        //let revExcels = getLocalExcels @""
        //let revtransactions = ParserRevolutExcelAccountStatement.parseExcels userId revExcels

        //let omExcels = getLocalExcels @""
        //let omtransactions = ParserOrangeMoneyExcelAccountStatement.parseExcels userId omExcels

        //let omPdfs = getLocalPdfs @""
        //let omtransactions = ParserOrangeMoneyPdfAccountStatement.parsePdfs userId omPdfs

        let carrPdfs = getLocalPdfs @""
        let carrReceipts = ParserCarrefourPdfReceipt.parsePdfs userId carrPdfs


        printfn "Run succesfully"
        0