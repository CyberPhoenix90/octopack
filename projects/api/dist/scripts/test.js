"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const script_1 = require("./script");
class Test extends script_1.Script {
    autoComplete() {
        throw new Error('Method not implemented.');
    }
    help() {
        return {
            description: 'Tests stuff'
        };
    }
    async run(args, context) {
        return {};
    }
}
exports.Test = Test;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBzY3JpcHRfMSA9IHJlcXVpcmUoXCIuL3NjcmlwdFwiKTtcbmNsYXNzIFRlc3QgZXh0ZW5kcyBzY3JpcHRfMS5TY3JpcHQge1xuICAgIGF1dG9Db21wbGV0ZSgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNZXRob2Qgbm90IGltcGxlbWVudGVkLicpO1xuICAgIH1cbiAgICBoZWxwKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdUZXN0cyBzdHVmZidcbiAgICAgICAgfTtcbiAgICB9XG4gICAgYXN5bmMgcnVuKGFyZ3MsIGNvbnRleHQpIHtcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbn1cbmV4cG9ydHMuVGVzdCA9IFRlc3Q7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lkR1Z6ZEM1cWN5SXNJbk52ZFhKalpWSnZiM1FpT2lJaUxDSnpiM1Z5WTJWeklqcGJJblJsYzNRdWFuTWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklqczdRVUZCUVN4eFEwRkJhME03UVVGRGJFTXNUVUZCWVN4SlFVRkxMRk5CUVZFc1pVRkJUVHRKUVVNMVFpeFpRVUZaTzFGQlExSXNUVUZCVFN4SlFVRkpMRXRCUVVzc1EwRkJReXg1UWtGQmVVSXNRMEZCUXl4RFFVRkRPMGxCUXk5RExFTkJRVU03U1VGRFJDeEpRVUZKTzFGQlEwRXNUMEZCVHp0WlFVTklMRmRCUVZjc1JVRkJSU3hoUVVGaE8xTkJRemRDTEVOQlFVTTdTVUZEVGl4RFFVRkRPMGxCUTBRc1MwRkJTeXhEUVVGRExFZEJRVWNzUTBGQlF5eEpRVUZKTEVWQlFVVXNUMEZCVHp0UlFVTnVRaXhQUVVGUExFVkJRVVVzUTBGQlF6dEpRVU5rTEVOQlFVTTdRMEZEU2p0QlFWcEVMRzlDUVZsREluMD0iXX0=