import {
  window,
  Disposable,
  ExtensionContext,
  StatusBarAlignment,
  StatusBarItem,
  commands,
} from 'vscode'
import * as cp from 'child_process'

export function activate(context: ExtensionContext) {
  let languageDetector = new LanguageDetection()
  let controller = new LanguageDetectionController(languageDetector)
  context.subscriptions.push(languageDetector)
  context.subscriptions.push(controller)
  commands.registerCommand('lang-status.changeLang', () => {
    setTimeout(() => {
      languageDetector.detect()
    }, 300)
  })
}

export class LanguageDetection {
  private _statusBarItem: StatusBarItem = window.createStatusBarItem(
    StatusBarAlignment.Right
  )

  private pretifyLanguage(currentLanguage: string): string {
    if (currentLanguage === 'ABC') {
      return 'EN'
    }

    let lang = currentLanguage.toUpperCase().replace('"', '')

    if (lang.match(/\./)) {
      return lang.replace(/[^.]+$/, '')
    }

    return lang.slice(0, 2)
  }

  public detect() {
    switch (process.platform) {
      case 'darwin':
        cp.exec(
          'defaults read ~/Library/Preferences/com.apple.HIToolbox.plist AppleSelectedInputSources',
          (err, stdout, stderr) => {
            const langMatch = stdout.match(/"KeyboardLayout Name" = (.*);/)
            const currentLanguage = langMatch && langMatch[1]
            if (currentLanguage) {
              this._statusBarItem.text = this.pretifyLanguage(currentLanguage)
              this._statusBarItem.show()
            }
            if (err) {
              console.log('error: ' + err)
            }
          }
        )

        break
    }
  }

  dispose() {
    this._statusBarItem.dispose()
  }
}

export class LanguageDetectionController {
  private _languageDetection: LanguageDetection
  private _disposable: Disposable

  constructor(languageDetection: LanguageDetection) {
    this._languageDetection = languageDetection
    let subscriptions: Disposable[] = []
    window.onDidChangeWindowState(this._onEvent, this, subscriptions)
    this._languageDetection.detect()
    this._disposable = Disposable.from(...subscriptions)
  }

  dispose() {
    this._disposable.dispose()
  }

  private _onEvent() {
    this._languageDetection.detect()
  }
}
