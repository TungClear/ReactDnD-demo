import React from 'react';
import { Card, Input } from 'antd';
import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import DragCard from './DragCard';
import update from 'immutability-helper';

const { TextArea } = Input;
class CardDemo extends React.Component {

	constructor(props) {
		super(props)
		//khi bên dragCard gọi moveCard thì state nó không hiểu nên phải bind để khởi tạo state
		this.moveCard = this.moveCard.bind(this);
		this.state = {
			cards: [
				{
					key: 1,
				},
				{
					key: 2,
				},
				{ key: 3 },
				{ key: 4 },
			]
		}
	}

	moveCard(dragIndex, hoverIndex) {
		const { cards } = this.state;
		console.log(`move card: ${JSON.stringify(cards)}`);

		const dragCard = cards[dragIndex];

		this.setState(
			update(this.state, {
				cards: {
					$splice: [[dragIndex, 1], [hoverIndex, 0, dragCard]],
				},
			}),
		);
	}

	handleOnSelect = (event) => {
		const {value} = event.target
		console.log(value);
		const selection = value.substring(event.target.selectionStart, event.target.selectionEnd);
		console.log(selection);
	}

	render() {
		const { cards } = this.state;
		console.dir(`done move: ${JSON.stringify(cards)}`);
		return (
			<React.Fragment>
				<div>
					<TextArea placeholder="Autosize height based on content lines" autosize onSelect={this.handleOnSelect}/>
				</div>
				<div className="wrap-card">
					{cards.map((item, index) => {
						return (
							<DragCard
								key={index}
								index={index}
								id={item.key}
								moveCard={this.moveCard}
							>
								<Card
									title={item.key}
									extra={<a href="#">More</a>}
								>
									<p>Card content</p>
									<p>Card content</p>
									<p>Card content</p>
								</Card>
								<div style={{ height: '50px' }}></div>
							</DragCard>
						);
					})}
				</div>
			</React.Fragment>
		)
	}

}

export default DragDropContext(HTML5Backend)(CardDemo);