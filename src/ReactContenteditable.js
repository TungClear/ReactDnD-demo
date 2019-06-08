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
			// html: `Hello World <span class="bg-color" contenteditable="false" style="background:${arrayColor[3]}">thuong em la</span> dieu anh khong the ngo`,
			html: `Hello&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; World thuong em la dieu anh khong the ngo Hello world`,
			editable: true,
			selection: '',
			clientX: 0,
			clientY: 0,
			count: 0,
			textValue: `Hello&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; World thuong em la dieu anh khong the ngo Hello world`,
			isDisplay: false,
			arraySelected: [
				// {
				// 	key: 0,//vị trí span màu tính từ index 0 của textValue
				// 	startIndex: 0,
				// 	endIndex: 0,
				// 	name: '',//tên entities
				//  selection,
				// }
			],
			key: 0,
			range: '',
		};
	}

	componentDidMount() {
	}

	sanitizeConf = {
		allowedTags: ["b", "i", "em", "strong", "a", "p", "h1"],
		allowedAttributes: { a: ["href"] }
	};

	sanitize = () => {
		this.setState({ html: sanitizeHtml(this.state.html, this.sanitizeConf) });
	};

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

	displayDropdownMenu = (text) => {
		this.setState({ isDisplay: true, selection: text })
	}

	handleChangeEdit = evt => {
		this.setState({
			html: evt.target.value,
			textValue: sanitizeHtml(evt.target.value, this.sanitizeConf),
		});
	};

	handleOnMouseUp = (event) => {
		const { clientX, clientY } = event;
		// const { value } = event.target;
		const {textValue} = this.state;
		
		// const { html } = this.state;
		// if (window.getSelection) {
		// 	const sel = window.getSelection();
		// 	if (sel.toString().trim() === "") return;
		// 	this.setState({
		// 		selection: sel.toString(),
		// 		clientX,
		// 		clientY,
		// 		range: window.getSelection().getRangeAt(0)
		// 	})
		// }
		if(window.getSelection){
			if(window.getSelection().toString().trim() === ""){
				return;
			}else{
				let range = window.getSelection().getRangeAt(0);
				this.getSelection(range.startOffset, range.endOffset, textValue);
			}
		}
		
	}

	handleOnMouseDown = (event) => {
		this.setState({
			selection: '',
			isDisplay: false,
			range: '',
		})
		this.clearAllRanges();
	}

	addEntity = () => {
		//tắt dropdown và tô màu selected text
		let { selection, html, textValue, arraySelected, key, range } = this.state;
		const indexStart = range.startOffset, indexEnd = range.endOffset;

		if (arraySelected.length > 0) {
			const currentObject = {
				indexStart: indexStart,
				indexEnd: indexEnd,
				key: key,
				selection: selection,
			}

			arraySelected = this.checkOut(currentObject, arraySelected);
			
			arraySelected.forEach(item => {
				let newStr = `<span class="bg-color" contenteditable="false" style="background:${arrayColor[0]}">${item.selection}</span>`;
				return { ...item, newStr: newStr }
			})
			console.log(arraySelected);
			
			this.sortByStart(arraySelected);
			arraySelected.reverse();

			arraySelected.forEach(item => {
				html = this.replaceAt(html, item.newStr, item.indexStart, item.indexEnd);
			})

			this.setState({
				html: html,
				key: key + 1,
				selection: '',
				isDisplay: false,
				range: "",
			})

		} else {
			let newStr = `<span class="bg-color" contenteditable="false" style="background:${arrayColor[0]}">${selection}</span>`;
			if (indexStart !== -1) {
				textValue = this.replaceAt(textValue, newStr, indexStart, indexEnd);
				let select = {
					key: key,
					indexStart: indexStart,
					indexEnd: indexEnd,
					selection: selection,
				}
				arraySelected = [...arraySelected, select];

				console.log(arraySelected);
				this.setState({
					html: textValue,
					selection: '',
					isDisplay: false,
					arraySelected: arraySelected,
					range: "",
					key: key + 1,
				})
			};
			this.clearAllRanges()
		}
	}

	replaceAt = (input, replace, start, end) => {
		return input.slice(0, start)
			+ replace
			+ input.slice(end);
	}

	checkOut = (currentObject, arraySelected) => {
		arraySelected = arraySelected.map(item => {
			if (item.indexStart > currentObject.indexEnd || item.indexEnd < currentObject.indexStart) {
				//remove các span nằm trong
				//đang sai chỗ này
				return;
			}
			return item;
		});
		arraySelected.push(currentObject);
		console.log(arraySelected);
		return arraySelected
	}

	sortByStart = (array) => {
		return array.sort((a, b) => (a.indexStart > b.indexStart) ? 1 : ((b.indexStart > a.indexStart) ? -1 : 0));
	}

	getSelection = (startOffset, endOffset, textValue) => {
		console.log(textValue, textValue.charAt(startOffset) === " ");
		console.log(startOffset, textValue.charCodeAt(startOffset));
		
		if(textValue.charCodeAt(startOffset) === 32 || textValue.charCodeAt(startOffset) === 160){
			console.log(textValue.charCodeAt(startOffset) !== 32 || textValue.charCodeAt(startOffset) !== 160);
			// while(textValue.charAt(startOffset) !== " "){
				
			// 	startOffset--;
			// 	console.log(startOffset);
			// }
		}else{
			// while(startOffset === 0 || startOffset === " "){
			// 	startOffset++;
			// }
		}
		console.log(startOffset);
	}

	render = () => {
		const { selection, clientX, clientY, html, editable, textValue, isDisplay, range } = this.state;
		return (
			<div>
				<h3>editable contents</h3>
				<div>
					<ContentEditable
						className="editable"
						tagName="div"
						html={html} // innerHTML of the editable div
					// onChange={this.handleChangeEdit} // handle innerHTML change
					// onBlur={this.sanitize}
					// onMouseUp={this.handleOnMouseUp}
					// onMouseDown={this.handleOnMouseDown}
					/>
					<ContentEditable
						className="editable-2"
						tagName="div"
						html={sanitizeHtml(html, this.sanitizeConf)} // innerHTML of the editable div
						onChange={this.handleChangeEdit} // handle innerHTML change
						// onBlur={this.sanitize}
						onMouseUp={this.handleOnMouseUp}
						onMouseDown={this.handleOnMouseDown}
					/>
				</div>
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
				// onChange={this.handleChange}
				// onBlur={this.sanitize}
				/>
			</div>
		);
	};
}

export default ReactContentEditable;