using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAnalysis.Common.Configuration {
    public interface IEnvironmentConfiguration {

        string GetNpsqlConnectionString();
        string GetJWTKey();
    }
}
