const importData = { 'config_resolver': '../../config_resolver', 'file_system': '../../../libraries/file_system', 'logger': '../../../libraries/logger' };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIn0=
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxNQUFNLFVBQVUsR0FBRyxFQUFDLGlCQUFpQixFQUFFLHVCQUF1QixFQUFDLGFBQWEsRUFBRSxnQ0FBZ0MsRUFBQyxRQUFRLEVBQUUsMkJBQTJCLEVBQUMsQ0FBQTtBQUNySixNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFFOUIsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUM7QUFDdkMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsVUFBUyxJQUFJLEVBQUUsR0FBRyxJQUFJO0lBQzdDLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ3JCLElBQUksR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEIsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztLQUM1QztTQUFNO1FBQ04sT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztLQUMxQztBQUNGLENBQUMsQ0FBQztBQUVGLGtMQUFrTCJ9