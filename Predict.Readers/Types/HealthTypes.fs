namespace Predict.Types

open System
open CommonTypes

module HealthTypes =
    
    type ParsedHearthRate = 
        {
            Date: DateTime option
            Rate: int option
            Provider: Provider option
            IsAutomation: bool option
            DataOwnerId: int option
        }

