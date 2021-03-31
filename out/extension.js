"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageDetectionController = exports.LanguageDetection = exports.activate = void 0;
const vscode_1 = require("vscode");
const cp = require("child_process");
function activate(context) {
    let languageDetector = new LanguageDetection();
    let controller = new LanguageDetectionController(languageDetector);
    context.subscriptions.push(languageDetector);
    context.subscriptions.push(controller);
    vscode_1.commands.registerCommand('lang-status.changeLang', () => {
        setTimeout(() => {
            languageDetector.detect();
        }, 300);
    });
}
exports.activate = activate;
class LanguageDetection {
    constructor() {
        this._statusBarItem = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Right);
    }
    pretifyLanguage(currentLanguage) {
        if (currentLanguage === 'ABC') {
            return 'EN';
        }
        let lang = currentLanguage.toUpperCase().replace('"', '');
        if (lang.match(/\./)) {
            return lang.replace(/[^.]+$/, '');
        }
        return lang.slice(0, 2);
    }
    detect() {
        switch (process.platform) {
            case 'darwin':
                cp.exec('defaults read ~/Library/Preferences/com.apple.HIToolbox.plist AppleSelectedInputSources', (err, stdout, stderr) => {
                    const langMatch = stdout.match(/"KeyboardLayout Name" = (.*);/);
                    const currentLanguage = langMatch && langMatch[1];
                    if (currentLanguage) {
                        this._statusBarItem.text = this.pretifyLanguage(currentLanguage);
                        this._statusBarItem.show();
                    }
                    if (err) {
                        console.log('error: ' + err);
                    }
                });
                break;
        }
    }
    dispose() {
        this._statusBarItem.dispose();
    }
}
exports.LanguageDetection = LanguageDetection;
class LanguageDetectionController {
    constructor(languageDetection) {
        this._languageDetection = languageDetection;
        let subscriptions = [];
        vscode_1.window.onDidChangeWindowState(this._onEvent, this, subscriptions);
        this._languageDetection.detect();
        this._disposable = vscode_1.Disposable.from(...subscriptions);
    }
    dispose() {
        this._disposable.dispose();
    }
    _onEvent() {
        this._languageDetection.detect();
    }
}
exports.LanguageDetectionController = LanguageDetectionController;
//# sourceMappingURL=extension.js.map