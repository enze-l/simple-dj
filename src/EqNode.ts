export interface EqNodeProps{
    audioContext: AudioContext
    type: 'lowshelf' | 'peaking' | 'highshelf';
    frequency: number;
}

class EqNode {
  node: BiquadFilterNode;

  constructor(audioContext: AudioContext, type: 'lowshelf' | 'peaking' | 'highshelf', frequency: number) {
    this.node = audioContext.createBiquadFilter();
    this.node.type = type;
    this.node.frequency.value = frequency;
    this.node.gain.value = 0.0;
  }

  getNode(): AudioNode { return this.node; }

  setGain(gain: number) { this.node.gain.value = gain; }

  getGain() { return this.node.gain.value; }
}

export default EqNode;
