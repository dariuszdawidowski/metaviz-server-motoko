import { Component } from '/src/utils/Component.js';

export class Spinner extends Component {

    constructor(args) {
        super({...
            args,
            html: `
                <div id="metaviz-spinner" style="display: none;">
                    <svg xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 50 50" height="64" width="64">
                        <g transform="translate(0,-247)">
                            <g transform="matrix(0.35277777,0,0,-0.35277777,-42.666529,253.98439)">
                                <g style="fill: var(--metaviz-logo-save);" transform="translate(240.41395,-34.864343)">
                                    <path d="M 0,0 -16.2,16.202 -32.404,32.407 -32.405,32.405 -48.601,48.604 -64.806,32.405 -64.808,32.407 -81.005,16.202 -97.213,0 -113.41,-16.2 -97.213,-32.4 -81.005,-16.2 -64.808,0 -48.601,-16.204 -32.404,0 -16.2,-16.2 0.001,-32.405 16.205,-16.204 Z"/>
                                </g>
                                <g style="fill: var(--metaviz-logo-save);" transform="translate(208.00965,-67.269543)">
                                    <path d="M 0,0 -16.197,-16.2 -32.403,0 -48.601,-16.2 -32.403,-32.404 -16.197,-48.604 0,-32.404 16.204,-16.2 Z"/>
                                </g>
                            </g>
                        </g>
                    </svg>
                </div>
            `
        });

        // Attach to body
        document.body.append(this.element);

    }

    show() {
        this.element.style.display = 'block';
    }

    hide() {
        this.element.style.display = 'none';
    }

}
