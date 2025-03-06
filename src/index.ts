import type { ExtensionContext, TextDocument } from 'vscode';
import { MarkdownString, OverviewRulerLane, Range, window, workspace, env, Uri } from 'vscode';
import { disposeSettingListener, initialSetting } from './settings';
import { Log } from './log';
import { EXT_NAME, baseHTMLContent, baseHTMLContentDark, mockDocument } from './constant';
import { svg64 } from './svg64';
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
    const regEx = /(^|\s|[<>\[\]()={},:?;'"`\-+])(\/((?:\\\/|\[[^\]]*\]|[^/])+)\/([gimuy]+))(\s|[<>\[\]()={},:?;'"`\-+]|$)/g;
    // const regEx = /(^|\s|[()={},:?;])(\/((?:\\\/|\[[^\]]*\]|[^/])+)\/([gimuy]*))(\s|[()={},:?;]|$)/g;
    async function updateDecorations() {
        if (!activeEditor) {
            return;
        }
        
        const matches = await findRegexes(activeEditor.document);
        
        activeEditor.setDecorations(smallNumberDecorationType, matches);
    }
    
    async function createRegexMatch(document: TextDocument, line: number, match: RegExpExecArray) {
        const regex = createRegex(match[3], match[4]);
        if (regex) {
            var regexBase = regex.toString();
            var regexStr = regexBase;
            
            // Fix for svg64 (resul string will be shorter, causing some empty spaces)
            regexStr = regexStr.replace(/</g, "&lt;")
            regexStr = regexStr.replace(/>/g, "&gt;")
            regexStr = regexStr.replace(/ /g, "•") //␣
            
            const regexper = new Regexper(mockDocument.body);
            
            // console.log("CommandService#executeCommandDEV ❯", regexStr);
            await regexper.showExpression(regexStr);
            
            const svgParentContainer = regexper.svgContainer.querySelector('svg');
            
            svgParentContainer.removeChild(svgParentContainer.querySelector('metadata'));
            
            let originContent = svgParentContainer.outerHTML;
            
            // Dark Theme
            if(workspace.getConfiguration("regex-hover").get("darkTheme")){
                originContent = originContent.replace(/<text /g, "<text fill=\"#CECAC3\" ")
            }
            
            // Fix for svg64
            originContent = originContent.replace(//g, "▯")
            
            const base64SVGStr = svg64(originContent);
            const result = base64SVGStr;
            var encUrl = encodeURIComponent(regexBase)
            
            // console.log("CommandService#executeCommandDEV ❯", regexStr);
            // console.log("CommandService#executeCommandDEV ❯", originContent);
            // console.log("CommandService#executeCommandDEV ❯", originContent.match(/<desc>/g));
            var dom;
            
            // Another site + emoji
            if(originContent.match(/<desc>/g) === null) {
                // console.log("CommandService#executeCommandDEV ❯", encUrl);
                // var copyString = env.clipboard.writeText(`${regexBase}`);
                // dom = `[👁️ Open in browser](https://regex-vis.com/?r=${encUrl})<br/>[📎 Copy](${copyString})`;
                dom = `[👁️ Open in browser](https://regex-vis.com/?r=${encUrl})`;
            } else {
                dom = `[👁️ Open in browser](https://regex-vis.com/?r=${encUrl})<br/><img src="${result}"/>`;
                // dom = `[Regex Vis](https://regex-vis.com/?r=${encUrl}) | [Regexper](https://regexper.com/#${encUrl})<br/><img src="${result}"/>`;
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
        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            let match: RegExpExecArray | null;
            const regex = regEx;
            regex.lastIndex = 0;
            const text = line.text.substr(0, 1000);
            // eslint-disable-next-line no-cond-assign
            while ((match = regex.exec(text))) {
                const resultf = await createRegexMatch(document, i, match);
                if (resultf) {
                    matches.push(resultf);
                }
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
