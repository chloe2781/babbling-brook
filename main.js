
var audioCtx1;
var audioCtx2;
const playBab = document.getElementById('babbling-brook');
const playNoise = document.getElementById('more-noise');

playBab.addEventListener('click', function () {
    if (!audioCtx1) {
        if(audioCtx2){ audioCtx2.suspend();}
        babbling_brook();
        return;
    }
    else if (audioCtx1.state === 'suspended') {
        if(audioCtx2){ audioCtx2.suspend();}
        audioCtx1.resume();
    }
    else if (audioCtx1.state === 'running') {
        audioCtx1.suspend();
    }
}, false);


playNoise.addEventListener('click', function () {
    if (!audioCtx2) {
        if(audioCtx1){ audioCtx1.suspend();}
        moreNoise();
        return;
    }
    else if (audioCtx2.state === 'suspended') {
        if(audioCtx1){ audioCtx1.suspend();}
        audioCtx2.resume();
    }
    else if (audioCtx2.state === 'running') {
        audioCtx2.suspend();
    }
}, false);


function moreNoise(){
    audioCtx2 = new AudioContext()
    const oscillator = audioCtx2.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = 440; // Set the frequency to 440Hz (A4)

    // Create a resonant bandpass filter
    const filter = audioCtx2.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000; // Set the center frequency to 1000Hz
    filter.Q.value = 10; // Set the quality factor to 10

    // Connect the oscillator to the filter and the filter to the audio context's destination (e.g., your speakers)
    oscillator.connect(filter);
    filter.connect(audioCtx2.destination);

    // Start the oscillator
    oscillator.start();

}


function babbling_brook(){
    audioCtx1 = new AudioContext()

    const lowpass1 = audioCtx1.createBiquadFilter()
    lowpass1.type = 'lowpass'
    lowpass1.frequency.value = 400; //400

    const lowpass2 = audioCtx1.createBiquadFilter()
    lowpass2.type = 'lowpass'
    lowpass2.frequency.value = 14; //14

    const lowpass3 = audioCtx1.createBiquadFilter()
    lowpass3.type = 'lowpass'
    lowpass3.frequency.value = 10;

    const gain3 = audioCtx1.createGain();
    gain3.gain.value = 1500;

    const highpass = audioCtx1.createBiquadFilter()
    highpass.type = 'highpass'
    highpass.frequency.value = 500;
    highpass.Q.value = 1/0.03;

    const gain1 = audioCtx1.createGain();
    gain1.gain.value = 0.1;

    const gain2 = audioCtx1.createGain();
    gain2.gain.value = 400;



    const add = new ConstantSourceNode(audioCtx1, {offset: 500})

    var bufferSize = 10 * audioCtx1.sampleRate,
    noiseBuffer = audioCtx1.createBuffer(1, bufferSize, audioCtx1.sampleRate),
    output = noiseBuffer.getChannelData(0);

    var lastOut = 0;
    for (var i = 0; i < bufferSize; i++) {
        var brown = Math.random() * 2 - 1;

        output[i] = (lastOut + (0.02 * brown)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
    }

    brownNoise = audioCtx1.createBufferSource();
    brownNoise.buffer = noiseBuffer;
    brownNoise.loop = true;

    brownNoise.connect(lowpass1).connect(highpass)  
    highpass.connect(gain1).connect(audioCtx1.destination);

    brownNoise.connect(lowpass2).connect(gain2).connect(highpass.frequency)


    // new ////////
    brownNoise.connect(lowpass3).connect(gain3).connect(highpass.frequency)
    //////////////////////


    // gain2.connect(add.offset)
    // add.connect(highpass.frequency)

    // {RHPF.ar(LPF.ar(BrownNoise.ar(), 400), LPF.ar(BrownNoise.ar(), 14) * 400 + 500, 0.03, 0.1)}.play

    brownNoise.start(0);
}