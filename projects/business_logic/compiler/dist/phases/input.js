"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function inputPhase(model, context) {
    for (const p of model.projectsBuildData) {
        for (const pattern of p.project.resolvedConfig.build.bundles.dist.input) {
            const matches = await context.fileSystem.glob(p.project.path, pattern);
            p.input.push(...matches);
        }
    }
    return model;
}
exports.inputPhase = inputPhase;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcGhhc2VzL2lucHV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRU8sS0FBSyxVQUFVLFVBQVUsQ0FBQyxLQUFvQixFQUFFLE9BQXNCO0lBQzVFLEtBQUssTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLGlCQUFpQixFQUFFO1FBQ3hDLEtBQUssTUFBTSxPQUFPLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ3hFLE1BQU0sT0FBTyxHQUFHLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDdkUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQztTQUN6QjtLQUNEO0lBRUQsT0FBTyxLQUFLLENBQUM7QUFDZCxDQUFDO0FBVEQsZ0NBU0MifQ==