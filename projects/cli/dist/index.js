#!/usr/bin/env node
const importData = { 'api': '../../api', 'argument_parser': '../../libraries/argument_parser', 'config_resolver': '../../business_logic/config_resolver', 'file_system': '../../libraries/file_system', 'logger': '../../libraries/logger' };
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
require("./cli.js");
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsTUFBTSxVQUFVLEdBQUcsRUFBQyxLQUFLLEVBQUUsV0FBVyxFQUFDLGlCQUFpQixFQUFFLGlDQUFpQyxFQUFDLGlCQUFpQixFQUFFLHNDQUFzQyxFQUFDLGFBQWEsRUFBRSw2QkFBNkIsRUFBQyxRQUFRLEVBQUUsd0JBQXdCLEVBQUMsQ0FBQTtBQUN0TyxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFFOUIsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUM7QUFDdkMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsVUFBUyxJQUFJLEVBQUUsR0FBRyxJQUFJO0lBQzdDLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ3JCLElBQUksR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEIsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztLQUM1QztTQUFNO1FBQ04sT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztLQUMxQztBQUNGLENBQUMsQ0FBQztBQUNGLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQSJ9