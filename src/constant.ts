import { Window } from 'happy-dom';
export const EXT_NAME = 'regex-visualizer';

export const mockWindow = new Window();
export const mockDocument = mockWindow.document;

export const getCommandName = (name: string) => `${EXT_NAME}.${name}`;

export const baseHTMLContent = `
    <div id="regexp-render"><svg></svg></div>
    <script type="text/html" id="svg-container-base">
        <div class="svg">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlns:cc="http://creativecommons.org/ns#"
                xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
                version="1.1">
                <defs>
                <style type="text/css">svg {
            background-color: #fff; }
            
            .root text,
            .root tspan {
            font: 12px Arial; }
            
            .root path {
            fill-opacity: 0;
            stroke-width: 2px;
            stroke: #000; }
            
            .root circle {
            fill: #6b6659;
            stroke-width: 2px;
            stroke: #000; }
            
            .anchor text, .any-character text {
            fill: #fff; }
            
            .anchor rect, .any-character rect {
            fill: #6b6659; }
            
            .escape text, .charset-escape text, .literal text {
            fill: #000; }
            
            .escape rect, .charset-escape rect {
            fill: #bada55; }
            
            .literal rect {
            fill: #dae9e5; }
            
            .charset .charset-box {
            fill: #cbcbba; }
            
            .subexp .subexp-label tspan,
            .charset .charset-label tspan,
            .match-fragment .repeat-label tspan {
            font-size: 10px; }
            
            .repeat-label {
            cursor: help; }
            
            .subexp .subexp-label tspan,
            .charset .charset-label tspan {
            dominant-baseline: text-after-edge; }
            
            .subexp .subexp-box {
            stroke: #908c83;
            stroke-dasharray: 6,2;
            stroke-width: 2px;
            fill-opacity: 0; }
            
            .quote {
            fill: #908c83; }
            </style>
                </defs>
                <metadata>
                <rdf:RDF>
                    <cc:License rdf:about="http://creativecommons.org/licenses/by/3.0/">
                    <cc:permits rdf:resource="http://creativecommons.org/ns#Reproduction" />
                    <cc:permits rdf:resource="http://creativecommons.org/ns#Distribution" />
                    <cc:requires rdf:resource="http://creativecommons.org/ns#Notice" />
                    <cc:requires rdf:resource="http://creativecommons.org/ns#Attribution" />
                    <cc:permits rdf:resource="http://creativecommons.org/ns#DerivativeWorks" />
                    </cc:License>
                </rdf:RDF>
                </metadata>
            </svg>
            </div>
            <div class="progress">
            <div style="width:0;"></div>
        </div>
    </script>
`;

export const baseHTMLContentDark = `
    <div id="regexp-render"><svg></svg></div>
    <script type="text/html" id="svg-container-base">
        <div class="svg">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlns:cc="http://creativecommons.org/ns#"
                xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
                version="1.1">
                <defs>
                <style type="text/css">svg {
            background-color: #111111; }
            
            .root text,
            .root tspan {
            font: 12px Arial; }
            
            .root path {
            fill-opacity: 0;
            stroke-width: 2px;
            stroke: #7555DA; }
            
            .root circle {
            fill: #111111;
            stroke-width: 2px;
            stroke: #7555DA; }
            
            .anchor text, .any-character text {
            fill: #FFFFFF; }
            
            .anchor rect, .any-character rect {
            fill: #6B6659; }
            
            .escape text, .charset-escape text, .literal text {
            fill: #000000; }
            
            .escape rect, .charset-escape rect {
            fill: #DAB855; }
            
            .literal rect {
            fill: #BADA55; }
            
            .charset .charset-box {
            fill: #6B6659; }
            
            .subexp .subexp-label tspan,
            .charset .charset-label tspan,
            .match-fragment .repeat-label tspan {
            font-size: 10px; }
            
            .repeat-label {
            cursor: help; }
            
            .subexp .subexp-label tspan,
            .charset .charset-label tspan {
            dominant-baseline: text-after-edge; }
            
            .subexp .subexp-box {
            stroke: #908C83;
            stroke-dasharray: 6,2;
            stroke-width: 2px;
            fill-opacity: 0; }
            
            .quote, .charset-range {
            fill: #000000; }
            </style>
                </defs>
                <metadata>
                <rdf:RDF>
                    <cc:License rdf:about="http://creativecommons.org/licenses/by/3.0/">
                    <cc:permits rdf:resource="http://creativecommons.org/ns#Reproduction" />
                    <cc:permits rdf:resource="http://creativecommons.org/ns#Distribution" />
                    <cc:requires rdf:resource="http://creativecommons.org/ns#Notice" />
                    <cc:requires rdf:resource="http://creativecommons.org/ns#Attribution" />
                    <cc:permits rdf:resource="http://creativecommons.org/ns#DerivativeWorks" />
                    </cc:License>
                </rdf:RDF>
                </metadata>
            </svg>
            </div>
            <div class="progress">
            <div style="width:0;"></div>
        </div>
    </script>
`;
