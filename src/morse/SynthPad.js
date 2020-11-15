import React from 'react';
import Audio from './Audio.js'

class SynthPad extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            masterGainValue: 80/100,
        };
    }
    
    // Fade in the MasterGainNode gain value to masterGainValue on mouseDown by .001 seconds
    play = () => {
        Audio.masterGainNode.gain.setTargetAtTime(this.state.masterGainValue, Audio.context.currentTime, 0.001)
    }

    // Fade out the MasterGainNode gain value to 0 on mouseDown by .001 seconds
    pause = () => {
        Audio.masterGainNode.gain.setTargetAtTime(0, Audio.context.currentTime, 0.001)
    }
    

    initializeMasterGain = () => {
        // Connect the masterGainNode to the audio context to allow it to output sound.
        Audio.masterGainNode.connect(Audio.context.destination)

        // Set masterGain Value to 0
        Audio.masterGainNode.gain.setValueAtTime(0, Audio.context.currentTime)
         // Create a GainNode for the oscillator, set it to 0 volume and connect it to masterGainNode
        const oscillatorGainNode = Audio.context.createGain()
        oscillatorGainNode.gain.setValueAtTime(0.2, Audio.context.currentTime)
        oscillatorGainNode.connect(Audio.masterGainNode)

        // Create OscillatorNode, connect it to its GainNode, and make it start playing.
        const oscillatorNode = Audio.context.createOscillator()
        oscillatorNode.connect(oscillatorGainNode)
        oscillatorNode.frequency.setValueAtTime(880, Audio.context.currentTime)
        oscillatorNode.start()
    }

    

    componentDidMount(){
        this.initializeMasterGain();
    }

    render() { return null }
} 

export default SynthPad;
