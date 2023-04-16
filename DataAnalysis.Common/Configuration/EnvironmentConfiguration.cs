using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAnalysis.Common.Configuration {
    public class EnvironmentConfiguration : IEnvironmentConfiguration {

        public string NpsqlConnectionString;
        public string TokenKey;

        public string GetNpsqlConnectionString() {
            return "host=localhost;username=postgres;password=admin;database=postgres";
        }

        public string GetJWTKey() {
            return "adskd]ad)-{admkwamd2312dsa";
        }
    }
}
