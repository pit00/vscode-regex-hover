import type { ExtensionContext, TextDocument } from 'vscode';
import { MarkdownString, Range, window, workspace, Uri, commands } from 'vscode';
import { disposeSettingListener, initialSetting } from './settings';
import { Log } from './log';
import { EXT_NAME, baseHTMLContent, baseHTMLContentDark, mockDocument } from './constant';
import { svg64 } from './svg64';
const path = require('path');
const os = require('os');
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import Regexper from './regexp-visualizer/js/regexper.js';

if(workspace.getConfiguration("regex-hover").get("darkTheme")){
    mockDocument.body.innerHTML = baseHTMLContentDark;
} else {
    mockDocument.body.innerHTML = baseHTMLContent;
}
interface RegexMatch {
    document: TextDocument
    regex: RegExp
    range: Range
}

export function activate(context: ExtensionContext) {
    Log.info(`${EXT_NAME} activated! `);
    // start listening settings
    initialSetting();
    
    const openSvgCmd = commands.registerCommand('regexHover.openSvg', async (svgBase64) => {
        if (!svgBase64) {
            window.showErrorMessage("No SVG data received.");
            return;
        }
        
          // ✅ Extract base64 part
        const base64 = svgBase64.replace(/^data:image\/svg\+xml;base64,/, '');
        
        // (optional safety)
        if (!base64 || base64 === svgBase64) {
            window.showErrorMessage("Invalid SVG data format");
            return;
        }
        
         // ✅ Create temp file
        const filePath = path.join(os.tmpdir(), `regex-${Date.now()}.svg`);
        
        await fs.promises.writeFile(filePath, Buffer.from(base64, 'base64'));
        
        const uri = Uri.file(filePath);
        
        // ✅ Open in tab
        await commands.executeCommand('vscode.open', uri);
    });
    
    const downloadSvgCmd = commands.registerCommand('regexHover.downloadSvg', async (svgBase64) => {
        if (!svgBase64) {
            window.showErrorMessage("No SVG data received.");
            return;
        }
        
          // ✅ Extract base64 part
        const base64 = svgBase64.replace(/^data:image\/svg\+xml;base64,/, '');
        
        // (optional safety)
        if (!base64 || base64 === svgBase64) {
            window.showErrorMessage("Invalid SVG data format");
            return;
        }
        
        const uri = await window.showSaveDialog({
            defaultUri: Uri.file("regex.svg"),
            filters: { SVG: ["svg"] }
        });
        
        if (!uri) return;
        
        const buffer = Buffer.from(base64, 'base64');
        await workspace.fs.writeFile(uri, buffer);
        
        window.showInformationMessage('SVG saved!');
    });
    
    context.subscriptions.push(openSvgCmd, downloadSvgCmd);
    
    const smallNumberDecorationType = window.createTextEditorDecorationType({
        borderWidth: '0 0 1px 0',
        borderStyle: 'dashed',
        // borderRadius: '3px',
        // overviewRulerColor: 'blue',
        // overviewRulerLane: OverviewRulerLane.Right,
        // textDecoration: '',
        // before: {
        //     borderColor: '#f00',
        // },
        // after: {
        //     borderColor: '#00f',
        // },
        light: { // this color will be used in light color themes
            borderColor: 'darkblue'
        },
        dark: { // this color will be used in dark color themes
            borderColor: 'lightblue'
            // borderColor: '#80CC40'
        },
    });
    let activeEditor = window.activeTextEditor;
    const regEx = /(^|\s|[<>\[\]()={},:?;'"`\-+])(\/((?:\\\/|\[[^\]]*\]|[^/])+)\/([gimuy ]+)?)(\s|[<>\[\]()={},:?;'"`\-+]|$)/g;
    // const regEx = /(^|\s|[()={},:?;])(\/((?:\\\/|\[[^\]]*\]|[^/])+)\/([gimuy]*))(\s|[()={},:?;]|$)/g;
    async function updateDecorations() {
        if (!activeEditor) {
            return;
        }
        
        const matches = await findRegexes(activeEditor.document);
        
        activeEditor.setDecorations(smallNumberDecorationType, matches);
    }
    
    function processRegex(str: string) {
        const matches = str.match(/\(\?<=|\(\?<!|\(\?=|\(\?!/g) || [];
        
        const hasBehind = matches.some(t => t === "(?<="|| t === "(?<!");
        const hasAhead = matches.some(t => t === "(?=" || t === "(?!");
        if (!(hasBehind && hasAhead)) return hasBehind;
        
        // true = behind, false = ahead
        return matches.map(t => t === "(?<=" || t === "(?<!");
    }
    
    function replaceLookaheadWords(svgText: string, vector: boolean[] | boolean) {
        if (!vector) return svgText;
        
        const pattern = /lookahead/g;
        
        // case 1: single boolean
        if (typeof vector === "boolean") {
            return vector
                ? svgText.replace(pattern, "lookbehind")
                : svgText;
        }
        
        // case 2: array
        let i = 0;
        
        return svgText.replace(pattern, (match) => {
            const shouldReplace = vector[i++] ?? false;
            return shouldReplace ? "lookbehind" : match;
        });
    }
    
    async function createRegexMatch(document: TextDocument, line: number, match: RegExpExecArray) {
        const regex = createRegex(match[3], match[4]);
        if (regex) {
            let regexBase = regex.toString();
            let looks = processRegex(regexBase)
            regexBase = regexBase.replace(/\(\?<=/g, "(?=") // +lookbehind: (?<=
            regexBase = regexBase.replace(/\(\?<!/g, "(?!") // -lookbehind: (?<!
            regexBase = regexBase.replace(/\(\?<.+?>/g, "(?=") // group label [not treated]
            
            const regexper = new Regexper(mockDocument.body);
            await regexper.showExpression(regexBase);
            const svgParentContainer = regexper.svgContainer.querySelector('svg');
            svgParentContainer.removeChild(svgParentContainer.querySelector('metadata'));
            let originContent = svgParentContainer.outerHTML;
            originContent = originContent.replace(/<text /g, "<text fill=\"#CECAC3\" ")
            originContent = originContent.replace(/(?<=<tspan>).*?(?=<\/tspan>)/g, function(matched: string){
                matched = matched.replace(/>/g, "&gt;")
                matched = matched.replace(/</g, "&lt;")
                matched = matched.replace(//g, "▯")
                matched = matched.replace(/(?<=[ ])( )|( )(?=[ ])/g, "•") //␣
                return(matched);
            })
            originContent = replaceLookaheadWords(originContent, looks)
            
            const base64SVGStr = svg64(originContent);
            const result = base64SVGStr;
            var encUrl = encodeURIComponent(regexBase)
            var dom;
            let arg = encodeURIComponent(JSON.stringify(result));
            
            // Another site + emoji
            if(originContent.match(/<desc>/g) === null) {
                dom = `[🪲 Debug](https://regex-vis.com/?r=${encUrl}) | [🔗 URL](https://regexper.com/#${encUrl})`;
            } else {
                dom = `[🪲 Debug](https://regex-vis.com/?r=${encUrl}) | [🖼️ Open](command:regexHover.openSvg?${arg}) | [⬇️ Download](command:regexHover.downloadSvg?${arg}) | [🔗 URL](https://regexper.com/#${encUrl})<br/><img src="${result}"/>`;
            }
            const message = new MarkdownString(dom);
            message.isTrusted = true;
            message.supportHtml = true;
            return {
                document,
                regex,
                range: new Range(line, match.index + match[1].length, line, match.index + match[1].length + match[2].length),
                hoverMessage: message,
            };
        }
    }
    
    function createRegex(pattern: string, flags: string) {
        try {
            return new RegExp(pattern, flags);
        } catch (e) {
            // discard
        }
    }
    
    async function findRegexes(document: TextDocument) {
        const matches: RegexMatch[] = [];
        
        const editor = window.activeTextEditor;
        if (!editor || editor.document !== document) {
            return matches;
        }
        
        const lineNumber = editor.selection.active.line;
        const line = document.lineAt(lineNumber);
        
        let match: RegExpExecArray | null;
        const regex = regEx;
        regex.lastIndex = 0;
        
        const text = line.text.substr(0, 1000);
        
        while ((match = regex.exec(text))) {
            const resultf = await createRegexMatch(document, lineNumber, match);
            if (resultf) {
                matches.push(resultf);
            }
        }
        
        return matches;
    }
    
    let timeout: NodeJS.Timer | undefined;
    
    function triggerUpdateDecorations(throttle = false) {
        if (timeout) {
            clearTimeout(timeout);
            timeout = undefined;
        }
        if (throttle) {
            timeout = setTimeout(updateDecorations, 500);
        } else {
            updateDecorations();
        }
    }
    
    if (activeEditor) {
        triggerUpdateDecorations();
    }
    
    window.onDidChangeActiveTextEditor((editor) => {
        activeEditor = editor;
        if (editor) {
            triggerUpdateDecorations();
        }
    }, null, context.subscriptions);
    
    workspace.onDidChangeTextDocument((event) => {
        if (activeEditor && event.document === activeEditor.document) {
            triggerUpdateDecorations(true);
        }
    }, null, context.subscriptions);
}

// process exit;
export function deactivate() {
    disposeSettingListener();
    
    Log.info(`${EXT_NAME} deactivate! `);
}
