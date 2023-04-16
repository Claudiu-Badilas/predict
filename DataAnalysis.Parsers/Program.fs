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

        //let raifExcels = getLocalExcels @"C:\Users\Claudiu\IdeaProjects\Projects\DataAnalysisFiles\AccountStatements\Raiffaisen"
        //let raitransactions = ParserRaiffeisenExcelAccountStatement.parseExcels dataOwnerId raifExcels
        
        let raifExcels = getLocalCsvs @"C:\Users\Claudiu\Desktop\samsunghealth_claudiu.badilas_20230409204798"
        //let raitransactions = ParserRaiffeisenExcelAccountStatement.parseExcels dataOwnerId raifExcels

        //let revExcels = getLocalExcels @""
        //let revtransactions = ParserRevolutExcelAccountStatement.parseExcels dataOwnerId revExcels

        //let omExcels = getLocalExcels @""
        //let omtransactions = ParserOrangeMoneyExcelAccountStatement.parseExcels dataOwnerId omExcels

        //let omPdfs = getLocalPdfs @"C:\Users\Claudiu\IdeaProjects\Projects\DataAnalysisFiles\AccountStatements\OrangeMoney\PDFs"
        //let omtransactions = ParserOrangeMoneyPdfAccountStatement.parsePdfs dataOwnerId omPdfs

        //let carrPdfs = getLocalPdfs @"C:\Users\Claudiu\IdeaProjects\Projects\DataAnalysisFiles\Receipts\Carrefour"
        //let carrReceipts = ParserCarrefourPdfReceipt.parsePdfs dataOwnerId carrPdfs
        
        let carrPdfs = 
            getLocalCsvs @"C:\Users\Claudiu\IdeaProjects\Projects\DataAnalysisFiles\Health\Mi Band\HEARTRATE_AUTO"
            |> List.iter(fun reader -> 
                let mutable data = []
                while not reader.EndOfStream do
                    let values = reader.ReadLine().Split(',')
                    data <- values :: data
                reader.Close()

                data
                |> List.toArray
                |> Array.Parallel.iter(fun row ->
                    row |> Array.iter(fun r -> printf "%s " r)
                    printfn ""
                )
            )
        //let carrReceipts = ParserCarrefourPdfReceipt.parsePdfs dataOwnerId carrPdfs
        (*let data =
            ["\\1"; "\\2"; "\\3"; "\\4"; "\\5"; "\\6"; "\\7"; "\\8"; "\\9"; "\\a"; "\\b"; "\\c"; "\\d"; "\\e"; "\\f"]
            |> List.map(fun n -> 
                getLocalJsons ("C:\Users\Claudiu\Desktop\samsunghealth_claudiu.badilas_20230409204798\jsons\com.samsung.shealth.exercise" +  n)
            )
            |> List.concat
            |> List.map(fun reader ->
                let json = reader.ReadToEnd()
                //let parsedJson = JsonConvert.DeserializeObject(json)
                0
            )*)
        printfn "Run succesfully"
        0