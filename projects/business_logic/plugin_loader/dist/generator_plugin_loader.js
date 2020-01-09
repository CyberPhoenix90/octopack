"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tsconfig_mapping_generator_1 = require("../../plugins/tsconfig_mapping_generator");
function loadGeneratorPlugin(plugin) {
    if (typeof plugin === 'string') {
        return initializeGeneratorPlugin(plugin, {});
    }
    else {
        return initializeGeneratorPlugin(plugin.name, plugin.arguments);
    }
}
exports.loadGeneratorPlugin = loadGeneratorPlugin;
function initializeGeneratorPlugin(name, args) {
    switch (name) {
        case 'tsconfigMappingGenerator':
            return tsconfig_mapping_generator_1.tsconfigMappingGenerator(args);
        default:
            throw new Error(`Generator Plugin ${name} not found`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdG9yX3BsdWdpbl9sb2FkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJnZW5lcmF0b3JfcGx1Z2luX2xvYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUdBLHlGQUFvRjtBQUVwRixTQUFnQixtQkFBbUIsQ0FBQyxNQUFnQztJQUNuRSxJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsRUFBRTtRQUMvQixPQUFPLHlCQUF5QixDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztLQUM3QztTQUFNO1FBQ04sT0FBTyx5QkFBeUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUNoRTtBQUNGLENBQUM7QUFORCxrREFNQztBQUVELFNBQVMseUJBQXlCLENBQUMsSUFBWSxFQUFFLElBQWtCO0lBQ2xFLFFBQVEsSUFBSSxFQUFFO1FBQ2IsS0FBSywwQkFBMEI7WUFDOUIsT0FBTyxxREFBd0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2QztZQUNDLE1BQU0sSUFBSSxLQUFLLENBQUMsb0JBQW9CLElBQUksWUFBWSxDQUFDLENBQUM7S0FDdkQ7QUFDRixDQUFDIn0=