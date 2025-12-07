open System.IO
open IronXL
open DataAnalysis.Parsers
open iTextSharp.text.pdf
open System
open DataAnalysis.Parsers.OMParsers
open DataAnalysis.Parsers.OMParsers.AccountStatementParser
open DataAnalysis.Parsers.AccountStatementParser
open DataAnalysis.Parsers.ReceiptParser
open System.IO
open Newtonsoft.Json
open DataAnalysis.Parsers.HealthParser

module ParserConsole =

    let getLocalExcels path =
        Directory.EnumerateFiles(path, "*.xlsx")
        |> Seq.append(Directory.EnumerateFiles(path, "*.xls"))
        |> Seq.toList
        |> List.map(fun f -> Path.Combine(path, f) |> WorkBook.Load)


    let getLocalPdfs path =
        Directory.EnumerateFiles(path, "*.pdf")
        |> Seq.toList 
        |> List.map(fun f -> new PdfReader(Path.Combine(path, f)))
   
   
    let getLocalCsvs path =
        Directory.EnumerateFiles(path, "*.csv")
        |> Seq.toList 
        |> List.map(fun f -> new StreamReader(f))
        
    let getLocalJsons path =
        Directory.EnumerateFiles(path, "*.json")
        |> Seq.toList 
        |> List.map(fun f -> new StreamReader(f))

    type Data =
        {
            Calorie: double option
            Distance: double option
            Segment: double option
            Speed: double option
            Start_time: double option
        }

    [<EntryPoint>]
    let main _ =
        let dataOwnerId = 1

        //let raifExcels = getLocalExcels @""
        //let raitransactions = ParserRaiffeisenExcelAccountStatement.parseExcels dataOwnerId raifExcels
        
        //let raifExcels = getLocalCsvs @""
        //let raitransactions = ParserRaiffeisenExcelAccountStatement.parseExcels dataOwnerId raifExcels

        //let revExcels = getLocalExcels @""
        //let revtransactions = ParserRevolutExcelAccountStatement.parseExcels dataOwnerId revExcels

        //let omPdfs = getLocalPdfs @""
        //let omtransactions = ParserOrangeMoneyPdfAccountStatement.parsePdfs dataOwnerId omPdfs

        //let carrPdfs = getLocalPdfs @"r"
        //let carrReceipts = ParserCarrefourPdfReceipt.parsePdfs dataOwnerId carrPdfs
        
        //let heartRatecsv = getLocalCsvs @""
        //let rates = ParserZeppLifeHeartRate.parseCsvs dataOwnerId heartRatecsv

        let results = BCRMortgageMapper.getBcrMorgages()

        printfn "Run succesfully"
        0