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
        let dataOwnerId = 1

        //let raifExcels = getLocalExcels @""
        //let raitransactions = ParserRaiffeisenExcelAccountStatement.parseExcels dataOwnerId raifExcels

        //let revExcels = getLocalExcels @""
        //let revtransactions = ParserRevolutExcelAccountStatement.parseExcels dataOwnerId revExcels

        //let omExcels = getLocalExcels @""
        //let omtransactions = ParserOrangeMoneyExcelAccountStatement.parseExcels dataOwnerId omExcels

        //let omPdfs = getLocalPdfs @""
        //let omtransactions = ParserOrangeMoneyPdfAccountStatement.parsePdfs dataOwnerId omPdfs

        let carrPdfs = getLocalPdfs @""
        let carrReceipts = ParserCarrefourPdfReceipt.parsePdfs dataOwnerId carrPdfs


        printfn "Run succesfully"
        0