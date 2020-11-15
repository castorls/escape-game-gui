import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
class ComponentTemplate extends Component {
    // Used for unsubscribing when our component unmounts
    unsubSseSubject = null

    constructor(props) {
        super(props);
        this.state = {
            challenge: null,
            errorMessage: null,
            solvedToken:null   
        }
        this.handleSseEvent = this.handleSseEvent.bind(this);
    }

    componentDidMount() {
         axios({
            method: 'get',
            url: 'componentTemplate/getChallenge',
        }).then(res => {
            this.setState({ 
                challenge: res.data.challenge, 
                errorMessage: res.data.errorMessage,
                solvedToken: res.data.solvedToken
            });
        }).catch(err => { 
            var errMessage =  err.message;
            var errData = ((! err.response || err.response.data == null) ? null : err.response.data)
            if(errData){
                errMessage += ", error class : "+errData.errorClass + ", error message : "+errData.errorMessage
            }
            this.setState({challenge: null, solvedToken:null, errorMessage: errMessage});
        });
    }
    
    componentWillUnmount() {
        this.unsubSseSubject.unsubscribe()
    }

    handleSseEvent(evt) {
        if(evt.lastEventId === "timerEvent"){
            if(evt.data === "timer end"){
                //stop the component 
            }
        }
    }

    render() {
        return  <div className="componentTemplate container-fluid">
                <div className="row">
                    <div className="col-md-2">
                        {this.state.solvedToken != null ?
                        <div className="success-icon"></div>
                        :
                        <Button variant="primary" onClick={this.check} >Vérifier</Button> }
                    </div>
                </div>
                <div className="row">
                    { this.state.errorMessage &&
                        <h3 className="error"> { this.state.errorMessage } </h3> }
                </div>
            </div>
    }
}

export default ComponentTemplate; // Don’t forget to use export default!