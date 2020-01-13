"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const npm_installer_1 = require("../../plugins/npm_installer");
const project_importer_1 = require("../../plugins/project_importer");
const typescript_plugin_1 = require("../../plugins/typescript_plugin");
const meta_programming_1 = require("../../plugins/meta_programming");
const barrel_file_1 = require("../../plugins/barrel_file");
const output_plugin_1 = require("../../plugins/output_plugin");
function loadBuildPlugin(plugin) {
    if (typeof plugin === 'string') {
        return initializePlugin(plugin, {});
    }
    else {
        return initializePlugin(plugin.name, plugin.config);
    }
}
exports.loadBuildPlugin = loadBuildPlugin;
function initializePlugin(name, args) {
    switch (name) {
        case 'projectImporter':
            return project_importer_1.projectImporter(args);
        case 'typescript':
            return typescript_plugin_1.typescript(args);
        case 'npmInstall':
            return npm_installer_1.npmInstall(args);
        case 'metaProgramming':
            return meta_programming_1.metaProgramming(args);
        case 'barrelFile':
            return barrel_file_1.barrelFile(args);
        case 'output':
            return output_plugin_1.output(args);
        default:
            throw new Error(`Plugin ${name} not found`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRfcGx1Z2luX2xvYWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJ1aWxkX3BsdWdpbl9sb2FkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBR0EsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ3pELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUNqRSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDN0QsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ2pFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUN2RCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFFckQsTUFBTSxVQUFVLGVBQWUsQ0FBQyxNQUFnQztJQUMvRCxJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsRUFBRTtRQUMvQixPQUFPLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztLQUNwQztTQUFNO1FBQ04sT0FBTyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUNwRDtBQUNGLENBQUM7QUFFRCxTQUFTLGdCQUFnQixDQUFDLElBQVksRUFBRSxJQUFrQjtJQUN6RCxRQUFRLElBQUksRUFBRTtRQUNiLEtBQUssaUJBQWlCO1lBQ3JCLE9BQU8sZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzlCLEtBQUssWUFBWTtZQUNoQixPQUFPLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN6QixLQUFLLFlBQVk7WUFDaEIsT0FBTyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekIsS0FBSyxpQkFBaUI7WUFDckIsT0FBTyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUIsS0FBSyxZQUFZO1lBQ2hCLE9BQU8sVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3pCLEtBQUssUUFBUTtZQUNaLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JCO1lBQ0MsTUFBTSxJQUFJLEtBQUssQ0FBQyxVQUFVLElBQUksWUFBWSxDQUFDLENBQUM7S0FDN0M7QUFDRixDQUFDIn0=
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRfcGx1Z2luX2xvYWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJ1aWxkX3BsdWdpbl9sb2FkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrREFBeUQ7QUFDekQscUVBQWlFO0FBQ2pFLHVFQUE2RDtBQUM3RCxxRUFBaUU7QUFDakUsMkRBQXVEO0FBQ3ZELCtEQUFxRDtBQUNyRCxTQUFnQixlQUFlLENBQUMsTUFBTTtJQUNsQyxJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsRUFBRTtRQUM1QixPQUFPLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztLQUN2QztTQUNJO1FBQ0QsT0FBTyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUN2RDtBQUNMLENBQUM7QUFQRCwwQ0FPQztBQUNELFNBQVMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLElBQUk7SUFDaEMsUUFBUSxJQUFJLEVBQUU7UUFDVixLQUFLLGlCQUFpQjtZQUNsQixPQUFPLGtDQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakMsS0FBSyxZQUFZO1lBQ2IsT0FBTyw4QkFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVCLEtBQUssWUFBWTtZQUNiLE9BQU8sMEJBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM1QixLQUFLLGlCQUFpQjtZQUNsQixPQUFPLGtDQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakMsS0FBSyxZQUFZO1lBQ2IsT0FBTyx3QkFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVCLEtBQUssUUFBUTtZQUNULE9BQU8sc0JBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4QjtZQUNJLE1BQU0sSUFBSSxLQUFLLENBQUMsVUFBVSxJQUFJLFlBQVksQ0FBQyxDQUFDO0tBQ25EO0FBQ0wsQ0FBQztBQUNELHM1Q0FBczVDIn0=