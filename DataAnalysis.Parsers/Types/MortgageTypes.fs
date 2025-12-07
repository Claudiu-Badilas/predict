namespace DataAnalysis.Types

open System
open CommonTypes

module MortgageTypes =    
            
    type ParsedRata = 
        {
            NrCtr: int option
            DataPlatii: DateTime option
            RataCredit: double option
            RataDobanda: double option
            ComisionAdministrare: double option
            CosturuAsigurare: double option
            ComisionGestiune: double option
            DobadaRecalculata: double option
            TotalRata: double option
            SoldRestPlata: double option
        }
