import React, { Component } from 'react';
import './App.scss';
import Mastermind from './mastermind/Component.js'; 
import Morse from './morse/Component.js'; 
import Timer from './timer/Component.js'; 
import axios from "axios"
import { Subject } from 'rxjs'

axios.defaults.baseURL = 'http://eclais.castor-et-herlie.org/RestWebapp/'
axios.defaults.baseURL = 'http://localhost:8080/RestWebapp/'
// The Main Subject/Stream to be listened on.
const sseSubject = new Subject()
class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
        timerEnd: false,
    }
}

  componentDidMount() {
    let eventSource = new EventSource(axios.defaults.baseURL + "stream")
    eventSource.onmessage = e => { 
      console.log(e); 
      sseSubject.next(e);
      if(e.lastEventId === "timerEvent"){
        if(e.data === "timer end"){
          this.setState({ timerEnd: true});
        }
      }
    }
  }

  render() {
    return <div className="App container-fluid">
      <link
        rel="stylesheet"
        href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css"
        integrity="sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk"
        crossOrigin="anonymous"
      />
      <div className="row">
        <Timer sseSubject={sseSubject} />
      </div>
      <div className="row">
        <div className="col-md-3">
          <Mastermind sseSubject={sseSubject} />
        </div>
        <div className="col-md-3">
          <Morse sseSubject={sseSubject} />
        </div>
       </div>
       <div className={"boom "+(this.state.timerEnd?"displayed":"")}>
        <img className="image" alt="" />
        Boom !!!
       </div>
     </div>
  }
}

export default App;
