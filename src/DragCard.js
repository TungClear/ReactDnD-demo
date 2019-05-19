
import React, { Component } from 'react';
import { DragSource, DropTarget } from 'react-dnd';

let dragingIndex = -1;

const cardSource = {
    beginDrag(props) {
        console.log(props.index);
        dragingIndex = props.index;
        return {
            index: props.index,
        };
    },
};

const cardTarget = {
    drop(props, monitor) {
        const dragIndex = monitor.getItem().index;
        const hoverIndex = props.index;

        // Don't replace items with themselves
        if (dragIndex === hoverIndex) {
            return;
        }

        // Time to actually perform the action
        props.moveCard(dragIndex, hoverIndex);

        // Note: we're mutating the monitor item here!
        // Generally it's better to avoid mutations,
        // but it's good here for the sake of performance
        // to avoid expensive index searches.
        monitor.getItem().index = hoverIndex;
    },
};


// @DropTarget('card', cardTarget, connect => ({
// 	connectDropTarget: connect.dropTarget()
// }))
// @DragSource('card', cardSource, (connect, monitor) => ({
// 	connectDragSource: connect.dragSource(),
// 	isDragging: false //monitor.isDragging()
// }))

class DragCard extends Component {

    render() {
        const { connectDragSource, connectDropTarget } = this.props;
        return connectDragSource(
            connectDropTarget(
                <div>
                    {this.props.children}
                </div>
            )
        );
    }
}

const DragableBodyCard =
    DropTarget('card', cardTarget, (connect, monitor) => ({
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
    }))
        (
            DragSource('card', cardSource, connect => ({
                connectDragSource: connect.dragSource(),
            }))(DragCard),
        );

export default DragableBodyCard;