import React, { Component } from 'react';
import axios from 'axios';

import './Component.scss'; 
class Timer extends Component {
    // Used for unsubscribing when our component unmounts
    unsubSseSubject = null
    constructor(props) {
        super(props);
        this.state = {
            interval: null,
            seconds: 120 - 3600,
            errorMessage: ''
        }
        this.unsubSseSubject =  props.sseSubject.subscribe(evt => {this.handleSseEvent(evt);})
    }

    componentDidMount() {
        axios({
            method: 'get',
            url: 'timer/getCounter',
        }).then(res => {
            var nbSeconds = res.data.seconds - 3600
            this.setState({ 
                seconds: nbSeconds,
                errorMessage: res.data.errorMessage
            });
        }).catch(err => { 
            var errMessage =  err.message;
            var errData = ((!err.reponse || err.response.data == null) ? null : err.response.data)
            if(errData){
                errMessage += ", error class : "+errData.errorClass + ", error message : "+errData.errorMessage
            }
            this.setState({seconds: 120 - 3600, errorMessage: errMessage});
        });
        this.setState({interval : setInterval(() => {
            var nbSeconds = this.state.seconds
            nbSeconds-- 
            if(nbSeconds <= -3600){
                nbSeconds = -3600
                clearInterval(this.state.interval);
            }
            this.setState({ 
                seconds: nbSeconds
            });
        }, 1000)});
    }

    componentWillUnmount(){
        clearInterval(this.state.interval);
        this.unsubSseSubject.unsubscribe()
    }

    handleSseEvent(evt) {
        //nothing to do
    }
  
    render (){
        var currentTime = new Date(0); // The 0 there is the key, which sets the date to the epoch
        currentTime.setUTCSeconds(this.state.seconds)
        const isWarning =  currentTime.getHours() === 0 &&  currentTime.getMinutes() < 2
        const hours = currentTime.getHours().toString().padStart(2, '0') 
        const minutes = currentTime.getMinutes().toString().padStart(2, '0')
        const seconds = currentTime.getSeconds().toString().padStart(2, '0')
        return <div className={"Timer "+ (isWarning ? "warning": "")}>
                {hours}:{minutes}:{seconds}
            </div>
    }
}
export default Timer;