import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import axios from 'axios'
import './Component.scss'; 
import SynthPad from './SynthPad.js'; 

const timing = 300  ;

class Morse extends Component {
    queue = [];  
    // Used for unsubscribing when our component unmounts
    unsubSseSubject = null

    constructor(props) {
        super(props);
        this.state = {
            hightlight: false,
            challenge: null,
            proposition: "",
            results: null,
            errorMessage: '',
            solvedToken:null   
        }
        this.handleChange = this.handleChange.bind(this);
        this.check = this.check.bind(this);
        this.handleSseEvent = this.handleSseEvent.bind(this);
    }

    componentDidMount() {
         axios({
            method: 'get',
            url: 'morse/getChallenge',
        }).then(res => {
            this.setState({ 
                challenge: res.data.challenge, 
                errorMessage: res.data.errorMessage,
                solvedToken: res.data.solvedToken
            });
            var challenge = this.state.challenge
            this.playMorseCode(challenge, 0, null)
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
        if(evt.lastEventId === "morseEvent"){
            this.getStateFromServer()
        }
        if(evt.lastEventId === "timerEvent"){
            if(evt.data === "timer end"){
                //stop the morse code
                for(const queueItem of this.queue){
                    clearTimeout(queueItem);
                } 
                this.getStateFromServer()
            }
        }
    }

    playMorseCode(challenge, index, player){
        if(index >= challenge.length){
            var timeout = setTimeout(() => { 
                this.queue.pop()
                this.playMorseCode(challenge, 0, null)
            },
            5000);
            this.queue.push(timeout)
            return
        }
        var car = challenge[index];
       if(car === '.'){
            this.setState({ hightlight: true})
            player && player.play()
            var timeout2 = setTimeout(() => { 
                this.queue.pop()
                this.setState({ hightlight: false})
                player && player.pause() ;
                var timeout3 = setTimeout(() => { 
                    this.queue.pop()
                    this.playMorseCode(challenge, index+1, player)
                }, timing)
                this.queue.push(timeout3)
            }, timing)
            this.queue.push(timeout2)
        }
        else if(car === '-'){
            this.setState({ hightlight: true})
            player && player.play()
            var timeout4 = setTimeout(() => {
                this.queue.pop()
                this.setState({ hightlight: false})
                player && player.pause()
                var timeout5 = setTimeout(() => { 
                    this.queue.pop()
                    this.playMorseCode(challenge, index+1, player)
                }, timing)
                this.queue.push(timeout5)
            }, 3*timing) 
            this.queue.push(timeout4)
        }
        else if(car === ' '){
            var timeout5 = setTimeout(() => {
                this.queue.pop()
                this.setState({ hightlight: false})
                player && player.pause()
                var timeout6 = setTimeout(() => { 
                    this.queue.pop()
                    this.playMorseCode(challenge, index+1, player)
                }, timing)
                this.queue.push(timeout6)
            }, timing)
            this.queue.push(timeout5)
        }
    }

    getStateFromServer() {
        axios({
            method: 'get',
            url: 'morse/getState',
        }).then(res => {
            var solution = res.data.solution
            if(res.data.token){
                this.setState({ 
                    proposition: solution,
                    solvedToken: res.data.token
                });
            }
            else{
                this.setState({ 
                    solvedToken: res.data.token
                }); 
            }
            var challenge = this.state.challenge
            if(challenge){
                this.playMorseCode(challenge, 0, null)
            }
        }).catch(err => { 
            var errMessage =  err.message;
            var errData = ((! err.response || err.response.data == null) ? null : err.response.data)
            if(errData){
                errMessage += ", error class : "+errData.errorClass + ", error message : "+errData.errorMessage
            }
            this.setState({challenge: null, solvedToken:null, errorMessage: errMessage});
        });
    }

    handleChange(event) {    this.setState({proposition: event.target.value});  }

    check(){
        var proposition= this.state.proposition     
        axios({
            method: 'post',
            url: 'morse/checkProposition',
            data: {
                value: proposition
            }
        }).then(res => {
            this.setState({ 
                results: res.data.results, 
                errorMessage: res.data.errorMessage,
                solvedToken: res.data.token
            });
        }).catch(err => { 
            var errMessage =  err.message;
            var errData = (err.response.data == null ? null : err.response.data)
            if(errData){
                errMessage += ", error class : "+errData.errorClass + ", error message : "+errData.errorMessage
            }
            this.setState({results: null, solvedToken:null, errorMessage: errMessage});
        });
    }
    
    render() {
        return  <div className="morse container-fluid">
                        <div className="row">
                            <div className="col-md-2">          
                                <SynthPad />
                                <div className={"flash "+(this.state.hightlight?"highlight":"")} /> 
                            </div>
                            <div className="col-md-8">
                                <label> Proposition : <input type="text" value={this.state.proposition} onChange={this.handleChange} /></label>
                            </div>
                            <div className="col-md-2">
                                {this.state.solvedToken != null ?
                                <div className="success-icon"></div>
                                :
                                <Button variant="primary" onClick={this.check} >Vérifier</Button> }
                                <Button variant="primary" onClick={this.check} >Vérifier</Button>
                            </div>
                        </div>
                        <div className="row">
                            { this.state.errorMessage &&
                                <h3 className="error"> { this.state.errorMessage } </h3> }
                        </div>
                    </div>
    }
}

export default Morse; // Don’t forget to use export default!