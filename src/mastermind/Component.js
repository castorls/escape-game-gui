import React, { Component } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Button from 'react-bootstrap/Button';
import axios from 'axios';

import './Component.scss'; 

const colors = [
    "RED", 
    "YELLOW",
    "BLUE" ,
    "ORANGE",
    "GREEN",
     "WHITE",
    "PURPLE",
    "ROSE"];

function getStyle(style, snapshot) {
    if (!snapshot.isDragging) return {};
    if (!snapshot.isDropAnimating) {
        return style;
    }
    
    return {
        ...style,
        // cannot be 0, but make it super tiny
        transitionDuration: `0.001s`
    };
}

class Mastermind extends Component {
    // Used for unsubscribing when our component unmounts
    unsubSseSubject = null
    constructor(props) {
        super(props);
        var defaultNbChoice = 4
        this.state = {
            nbChoice : defaultNbChoice,
            choices: new Array(defaultNbChoice).fill(null) , 
            results: new Array(defaultNbChoice).fill(null),
            errorMessage: null,
            solvedToken:null  
        };
        this.checkChoices = this.checkChoices.bind(this);
        this.handleSseEvent = this.handleSseEvent.bind(this);
    }

    componentDidMount() {
    }

    componentWillUnmount(){
        this.unsubSseSubject.unsubscribe()
    }
  
    handleSseEvent(evt) {
        if(evt.lastEventId === "timerEvent"){
            if(evt.data === "timer end"){
                //stop the component 
            }
        }
    }

    checkChoices(){
            var choicesValues= this.state.choices
            axios({
                method: 'post',
                url: 'mastermind/sendChoice',
                data: {
                    values: choicesValues
                }
            }).then(res => {
                this.setState({ 
                    results: res.data.results, 
                    errorMessage: res.data.errorMessage,
                    solvedToken: res.data.solvedToken
                });
            }).catch(err => { 
                var errMessage =  err.message;
                var errData = ((! err.response || err.response.data == null) ? null : err.response.data)
                if(errData){
                    errMessage += ", error class : "+errData.errorClass + ", error message : "+errData.errorMessage
                }
                this.setState({results: null, solvedToken:null, errorMessage: errMessage});
            });
    }

    render() {
        const onDragEnd = async (evt) => {
            if(evt.destination == null){
                return
            }
            var   draggableId  = evt.draggableId
            var  destinationId  = evt.destination.droppableId
            var choiceIndex
            var sourceIndex = (evt.source.droppableId &&  evt.source.droppableId.startsWith("mastermind-choice-droppable-")) ? 
                    parseInt(evt.source.droppableId.replace("mastermind-choice-droppable-", ""),10)
                    : -1
            if (destinationId.startsWith("mastermind-choice-droppable-")) {
                choiceIndex = parseInt(destinationId.replace("mastermind-choice-droppable-", ""),10)
                var previousValue =  this.state.choices[choiceIndex]
                this.state.choices[choiceIndex] = draggableId;
                if(sourceIndex !== -1){
                    this.state.choices[sourceIndex] = previousValue;
                }
            }
            else if(destinationId === "mastermind-color-droppable"){
                if(sourceIndex !== -1){
                    this.state.choices[sourceIndex] = null;
                }
            }
        };
        const currentState = this.state
        return  <div className="mastermind row">
                        <div className="col-md-10"> 
                            <DragDropContext onDragEnd={onDragEnd}>
                                <div className='row'>
                                <Droppable droppableId="mastermind-color-droppable" direction="horizontal">
                                {(provided, snapshot) => (
                                    <div
                                    className='droppable all-colors'
                                    ref={provided.innerRef}
                                    style={{ backgroundColor: snapshot.isDraggingOver ? 'blue' : '#EEEEEE' }}
                                    >
                                        {colors.filter(color  => ! currentState.choices.includes(color) ).map((item, index) => (
                                            <div className="colorContainer" key={item}>
                                            <Draggable
                                                key={item}
                                                draggableId={item}
                                                index={index}
                                            >
                                                {(provided, snapshot) => (
                                                <div key={"colorContainer"+ item}
                                                    className={'color '+ item}
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                >
                                                </div>
                                                )}
                                            </Draggable>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                </Droppable>
                            </div>
                            <div className='row'>
                                <div className="choices">
                                    {[...Array(currentState.nbChoice)].map((item, index) => (
                                        <Droppable key={"choice"+index}  direction="horizontal"
                                                droppableId={"mastermind-choice-droppable-"+index} isCombineEnabled>
                                            {(provided, snapshot) => (
                                                <div
                                                    className='droppable choiceContainer'
                                                    ref={provided.innerRef}
                                                    style={{ backgroundColor: snapshot.isDraggingOver ? 'blue' : '#EEEEEE' } }
                                                >
                                                    {(currentState.choices[index] == null) ? 
                                                        <div className='colorTarget'>
                                                            {index}
                                                        </div>
                                                        :
                                                        <Draggable
                                                            key={currentState.choices[index]}
                                                            draggableId={currentState.choices[index]}
                                                            index={index}
                                                        >
                                                            {({ innerRef, draggableProps, dragHandleProps }, snapshot) => (
                                                            <div
                                                                className={'color '+ currentState.choices[index]}
                                                                ref={innerRef}
                                                                {...draggableProps}
                                                                {...dragHandleProps}
                                                                style={getStyle(draggableProps.style, snapshot)}
                                                            >
                                                            </div>
                                                            )}
                                                        </Draggable>
                                                    }
                                                    <span style={{ display: "none" }} >
                                                        {provided.placeholder}
                                                    </span>
                                                </div>
                                            )}
                                        </Droppable>
                                    ))}
                                </div>
                            </div>
                            </DragDropContext>
                            <div className='row'>
                                <div className="check-results">
                                    {[...Array(currentState.nbChoice)].map((item, index) => (
                                        <div className='resultContainer' key={'resultContainer'+index}>
                                                <div className={'result result-'+(currentState.results == null || currentState.results[index] == null ? 'none' : currentState.results[index])}></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            { this.state.errorMessage &&
                                <h3 className="error"> { this.state.errorMessage } </h3> }
                        </div>
                        <div className="col-md-2">
                            {this.state.solvedToken != null ?
                            <div className="success-icon"></div>
                            :
                            <Button variant="primary" onClick={this.checkChoices} >Vérifier</Button> }
                        </div>
                    </div>
    }
}

export default Mastermind; // Don’t forget to use export default!