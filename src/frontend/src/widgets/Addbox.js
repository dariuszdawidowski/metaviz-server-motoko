import { Component } from 'frontend/src/utils/Component.js';
import { cleanString } from 'frontend/src/utils/Text.js';


export class Addbox extends Component {

    constructor(args) {
        super(args);

        this.freeze = false;

        this.callback = ('callback' in args) ? args.callback : null;

        const group = document.createElement('div');
        group.classList.add('addbox');
        this.element.append(group);

        this.button = document.createElement('div');
        this.button.classList.add('board-add');
        this.button.style.margin = '0';
        this.button.innerHTML = `<span class="plus">+</span><span class="add">${args.text}</span>`;
        this.button.addEventListener('click', () => {
            this.showInputField();
        });
        group.append(this.button);

        this.inputWrap = document.createElement('div');
        this.inputWrap.classList.add('board-add');
        this.inputWrap.style.display = 'none';
        group.append(this.inputWrap);

        this.input = document.createElement('input');
        if ('placeholder' in args) this.input.setAttribute('placeholder', args.placeholder);
        if ('list' in args) this.input.setAttribute('list', args.list);
        this.inputWrap.append(this.input);

        this.ok = document.createElement('button');
        this.ok.innerText = 'OK';
        this.ok.addEventListener('click', () => {
            this.okButton();
        });
        this.inputWrap.append(this.ok);

        // Bind events
        this.handleKeysBind = this.handleKeys.bind(this);
        this.unClickBind = this.unClick.bind(this);

    }

    // ESC/Enter keys
    handleKeys(event) {
        if (!this.freeze) {
            if (event.key === 'Escape') {
                this.hideInputField();
            }
            else if (event.key === 'Enter') {
                this.okButton();
            }
        }
    };

    // Unclick on body
    unClick(event) {
        let same = false;
        event.composedPath().forEach(element => {
            if (element instanceof HTMLElement && ['board-add'].some(className => element.classList.contains(className))) {
                same = true;
            }
        });
        if (!this.freeze && !same) this.hideInputField();
    };

    // OK input button Callback
    okButton() {
        const value = cleanString(this.input.value.trim());
        if (!this.freeze && value != '') {
            this.freeze = true;
            this.hideInputField();
            this.callback(value).then(() => {
                this.freeze = false;
            });
        }
    };

    // Show input field
    showInputField() {
        this.button.style.display = 'none';
        this.inputWrap.style.display = 'block';
        document.addEventListener('keydown', this.handleKeysBind);
        document.body.addEventListener('click', this.unClickBind);
    };

    // Hide input field
    hideInputField() {
        document.body.removeEventListener('click', this.unClickBind);
        document.removeEventListener('keydown', this.handleKeysBind);
        this.input.value = '';
        this.button.style.display = 'flex';
        this.inputWrap.style.display = 'none';
    };

}
