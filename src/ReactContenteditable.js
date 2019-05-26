import React, { Component } from 'react';
import ContentEditable from "react-contenteditable";
import sanitizeHtml from "sanitize-html";

const arrayColor = [
	"#ff4d4f", "#ff7a45", "#ffa940", "#ffc53d", "#ffec3d", "#bae637", "#73d13d",
	"#36cfc9", "#40a9ff", "#9254de"
]
class ReactContentEditable extends Component {

	constructor() {
		super();
		this.state = {
			html: `Hello World <span class="bg-color" contenteditable="false" style="background:${arrayColor[3]}">thuong em la</span> dieu anh khong the ngo`,
			editable: true,
			selection: '',
			clientX: 0,
			clientY: 0,
			count: 0,
			textValue: '',
			isDisplay: false,
		};
	}

	componentDidMount() {
		const { html } = this.state;
		const edits = document.getElementsByClassName('editable');
		console.log(edits);
		// edit.forEach(element => {
		// 	let span = element.getElementsByTagName('span')
		// 	span.forEach(el => {
		// 		el.addEventListener("click", this.displayDropdownMenu)
		// 	})
		// });
		for (let i = 0; i < edits.length; i++) {
			let span = edits[i].getElementsByTagName('span');
			console.log(span);
			if (span) {
				for (let j = 0; j < span.length; j++) {
					span[j].addEventListener('click', () => this.displayDropdownMenu(span[j].innerText));
					console.log(span[j].innerText);
				}
			}
		}
		this.setState({
			textValue: sanitizeHtml(html, this.sanitizeConf)
		})
	}

	displayDropdownMenu = (text) => {
		this.setState({ isDisplay: true, selection: text })
	}

	handleChangeEdit = evt => {
		const { html } = this.state;

		this.setState({
			html: evt.target.value,
			textValue: sanitizeHtml(evt.target.value, this.sanitizeConf),
		});
	};

	sanitizeConf = {
		allowedTags: ["b", "i", "em", "strong", "a", "p", "h1"],
		allowedAttributes: { a: ["href"] }
	};

	sanitize = () => {
		this.setState({ html: sanitizeHtml(this.state.html, this.sanitizeConf) });
	};

	handleOnMouseUp = (event) => {
		const { clientX, clientY } = event;
		const { value } = event.target;
		const { html } = this.state;
		console.log("innerText", event.target.innerText);
		console.log("html", html);
		if (window.getSelection) {
			const sel = window.getSelection();
			this.setState({
				selection: sel.toString(),
				clientX,
				clientY
			})
		}

	}

	handleOnMouseDown = (event) => {
		this.setState({
			selection: '',
			isDisplay: false
		})
		this.clearAllRanges();
	}

	handleChange = () => {
	}

	addEntity = () => {
		//tắt dropdown và tô màu selected text
		let { selection, html } = this.state;
		const indexStart = html.indexOf(selection);
		//tự động lấy thành chữ có nghĩa và trim 2 đầu
		let newStr = `<span class="bg-color" contenteditable="false" style="background:${arrayColor[0]}">${selection}</span>`;
		if (indexStart !== -1) {
			html = html.toString();
			newStr = newStr.toString()
			html = html.replace(selection, newStr);
			this.setState({
				html,
				selection: '',
				textValue: sanitizeHtml(html, this.sanitizeConf),
				isDisplay: false,
			})
		};

		this.clearAllRanges()

		// let span = document.createElement('span');
		// if (window.selection) {
		// 	const sel = window.getSelection();
		// 	const selection = sel.toString();
		// 	let startContainer = sel.getRangeAt(0).startContainer;
		// 	const childNodes = sel.getRangeAt(0).commonAncestorContainer.childNodes;
		// 	let index = 0;
		// 	startContainer = childNodes.filter(item => item.isEqualNode(startContainer))

		// }

	}

	clearAllRanges = () => {
		if (window.getSelection) {
			if (window.getSelection().empty) {  // Chrome
				window.getSelection().empty();
			} else if (window.getSelection().removeAllRanges) {  // Firefox
				window.getSelection().removeAllRanges();
			}
		} else if (document.selection) {  // IE?
			document.selection.empty();
		}
	}

	render = () => {
		const { selection, clientX, clientY, html, editable, textValue, isDisplay } = this.state;
		console.log(html);
		console.log(textValue);
		console.log(isDisplay);
		
		return (
			<div>
				<h3>editable contents</h3>
				<ContentEditable
					className="editable"
					tagName="pre"
					html={html} // innerHTML of the editable div
					disabled={!editable} // use true to disable edition
					onChange={this.handleChangeEdit} // handle innerHTML change
					// onBlur={this.sanitize}
					onMouseUp={this.handleOnMouseUp}
					onMouseDown={this.handleOnMouseDown}
				/>
				<ContentEditable
					className="editable-2"
					tagName="pre"
					html={html} // innerHTML of the editable div
					disabled={!editable} // use true to disable edition
					onChange={this.handleChangeEdit} // handle innerHTML change
					// onBlur={this.sanitize}
					onMouseUp={this.handleOnMouseUp}
					onMouseDown={this.handleOnMouseDown}
				/>
				{
					//sau khi dropdown tắt thì set selection = ''
					((clientX && clientY && selection !== '') || isDisplay)
						? (
							<ul className="dropdown-menu" style={{ top: `${clientY}px`, left: `${clientX}px` }}>
								<li onClick={this.addEntity} key='1'>Number 1</li>
								<li onClick={this.addEntity} key='2'>Number 2</li>
								<li onClick={this.addEntity} key='3'>Number 3</li>
								<li onClick={this.addEntity} key='4'>Number 4</li>
							</ul>
						)
						: null
				}
				<h3>source</h3>
				<textarea
					className="editable"
					value={html}
					onChange={this.handleChange}
				// onBlur={this.sanitize}
				/>
			</div>
		);
	};
}

export default ReactContentEditable;