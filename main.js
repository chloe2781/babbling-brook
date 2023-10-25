
var audioCtx1;
var audioCtx2;
const playBab = document.getElementById('babbling-brook');
const playNoise = document.getElementById('more-noise');

playBab.addEventListener('click', function () {
    if (!audioCtx1) {
        if(audioCtx2){ 
            audioCtx2.suspend();
            playNoise.style.backgroundColor = '#4CAF50';
        }
        playBab.style.backgroundColor = 'red';
        babbling_brook();
        return;
    }
    else if (audioCtx1.state === 'suspended') {
        if(audioCtx2){ 
            audioCtx2.suspend();
            playNoise.style.backgroundColor = '#4CAF50';
        }
        playBab.style.backgroundColor = 'red';
        audioCtx1.resume();
    }
    else if (audioCtx1.state === 'running') {
        audioCtx1.suspend();
        playBab.style.backgroundColor = '#4CAF50';
    }
}, false);

playNoise.addEventListener('click', function () {
    if (!audioCtx2) {
        if(audioCtx1){ 
            audioCtx1.suspend();
            playBab.style.backgroundColor = '#4CAF50';
        }
        playNoise.style.backgroundColor = 'red';
        moreNoise();
        return;
    }
    else if (audioCtx2.state === 'suspended') {
        if(audioCtx1){ 
            audioCtx1.suspend();
            playBab.style.backgroundColor = '#4CAF50';
        }
        playNoise.style.backgroundColor = 'red';
        audioCtx2.resume();
    }
    else if (audioCtx2.state === 'running') {
        audioCtx2.suspend();
        playNoise.style.backgroundColor = '#4CAF50';
    }
}, false);

function babbling_brook(){
    audioCtx1 = new AudioContext()

    const lowpass1 = audioCtx1.createBiquadFilter()
    lowpass1.type = 'lowpass'
    lowpass1.frequency.value = 400; 

    const lowpass2 = audioCtx1.createBiquadFilter()
    lowpass2.type = 'lowpass'
    lowpass2.frequency.value = 14; 

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
    brownNoise.connect(lowpass3).connect(gain3).connect(highpass.frequency)

    // {RHPF.ar(LPF.ar(BrownNoise.ar(), 400), LPF.ar(BrownNoise.ar(), 14) * 400 + 500, 0.03, 0.1)}.play

    brownNoise.start(0);
}

function moreNoise(){
    audioCtx2 = new AudioContext()
    const oscillator = audioCtx2.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = 1000 + Math.random() * 400;

    // Create a resonant bandpass filter
    const filter = audioCtx2.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 500 + Math.random() * 1000; // Set the center frequency to 1000Hz
    filter.Q.value = 2; // Set the quality factor to 10

    const gain = audioCtx2.createGain();
    gain.gain.value = 0.5 + Math.random() * 0.8;

    const delay = audioCtx2.createDelay();
    delay.delayTime.value = 0.1 + Math.random() * 0.4;

    // Connect the oscillator to the filter and the filter to the audio context's destination (e.g., your speakers)
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(delay);
    delay.connect(audioCtx2.destination);

    // Start the oscillator
    oscillator.start();

    const now = audioCtx2.currentTime;
    for (let i = 0; i < 200; i++) {
        const time = now + i*0.11;
        const frequency = 60 + Math.random() * 1000;
        oscillator.frequency.setValueAtTime(frequency, time);
    }
}
