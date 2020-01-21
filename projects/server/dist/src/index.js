const importData = { 'api': '../../../api', 'argument_parser': '../../../libraries/argument_parser', 'config_resolver': '../../../business_logic/config_resolver', 'logger': '../../../libraries/logger' };
const mod = require('module');
const original = mod.prototype.require;
mod.prototype.require = function (path, ...args) {
    if (importData[path]) {
        path = importData[path];
        return original.call(module, path, ...args);
    }
    else {
        return original.call(this, path, ...args);
    }
};
require("./main.js");
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxNQUFNLFVBQVUsR0FBRyxFQUFDLEtBQUssRUFBRSxjQUFjLEVBQUMsaUJBQWlCLEVBQUUsb0NBQW9DLEVBQUMsaUJBQWlCLEVBQUUseUNBQXlDLEVBQUMsUUFBUSxFQUFFLDJCQUEyQixFQUFDLENBQUE7QUFDck0sTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBRTlCLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDO0FBQ3ZDLEdBQUcsQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFVBQVMsSUFBSSxFQUFFLEdBQUcsSUFBSTtJQUM3QyxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUNyQixJQUFJLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hCLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7S0FDNUM7U0FBTTtRQUNOLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7S0FDMUM7QUFDRixDQUFDLENBQUM7QUFDRixPQUFPLENBQUMsV0FBVyxDQUFDLENBQUEifQ==