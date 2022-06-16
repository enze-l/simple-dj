const OfflineContext = (window.OfflineAudioContext);

/**
 * Detect BPM of a sound source
 * @param  {AudioBuffer} buffer Sound to process
 * @return {Number}             Detected BPM
 */

export default function detect(buffer) {
  const source = getLowPassSource(buffer);

  /**
     * Schedule the sound to start playing at time:0
     */

  source.start(0);

  /**
     * Pipe the source through the program
     */

  return [
    findPeaks,
    identifyIntervals,
    groupByTempo(buffer.sampleRate),
    getTopCandidate,
  ].reduce(
    (state, fn) => fn(state),
    source.buffer.getChannelData(0),
  );
}

export function getPeaks(data) {
  var partSize = 22050,
      parts = data[0].length / partSize,
      peaks = [];

  for (var i = 0; i < parts; i++) {
    var max = 0;
    for (var j = i * partSize; j < (i + 1) * partSize; j++) {
      var volume = Math.max(Math.abs(data[0][j]), Math.abs(data[1][j]));
      if (!max || (volume > max.volume)) {
        max = {
          position: j,
          volume: volume
        };
      }
    }
    peaks.push(max);
  }

  // We then sort the peaks according to volume...

  peaks.sort(function(a, b) {
    return b.volume - a.volume;
  });

  // ...take the loundest half of those...

  peaks = peaks.splice(0, peaks.length * 0.5);

  // ...and re-sort it back based on position.

  peaks.sort(function(a, b) {
    return a.position - b.position;
  });

  return peaks;
}

export function getIntervals(peaks) {

  // What we now do is get all of our peaks, and then measure the distance to
  // other peaks, to create intervals.  Then based on the distance between
  // those peaks (the distance of the intervals) we can calculate the BPM of
  // that particular interval.

  // The interval that is seen the most should have the BPM that corresponds
  // to the track itself.

  var groups = [];

  peaks.forEach(function(peak, index) {
    for (var i = 1; (index + i) < peaks.length && i < 10; i++) {
      var group = {
        tempo: (60 * 44100) / (peaks[index + i].position - peak.position),
        firstPos: peak.position,
        count: 1
      };

      while (group.tempo < 90) {
        group.tempo *= 2;
      }

      while (group.tempo > 180) {
        group.tempo /= 2;
      }

      group.tempo = Math.round(group.tempo);

      if (!(groups.some(function(interval) {
        return (interval.tempo === group.tempo ? interval.count++ : 0);
      }))) {
        groups.push(group);
      }
    }
  });
  return groups;
}

/**
 * Sort results by count and return top candidate
 * @param  {Object} Candidate
 * @return {Number}
 */

function getTopCandidate(candidates) {
  return candidates
    .sort((a, b) => (b.count - a.count))
    .splice(0, 5)[0].tempo;
}

/**
 * Apply a low pass filter to an AudioBuffer
 * @param  {AudioBuffer}            buffer Source AudioBuffer
 * @return {AudioBufferSourceNode}
 */

function getLowPassSource(buffer) {
  const { length, numberOfChannels, sampleRate } = buffer;
  const context = new OfflineContext(numberOfChannels, length, sampleRate);

  /**
     * Create buffer source
     */

  const source = context.createBufferSource();
  source.buffer = buffer;

  /**
     * Create filter
     */

  const filter = context.createBiquadFilter();
  filter.type = 'lowpass';

  /**
     * Pipe the song into the filter, and the filter into the offline context
     */

  source.connect(filter);
  filter.connect(context.destination);

  return source;
}

/**
 * Find peaks in sampleRate
 * @param  {Array} data Bugger channel data
 * @return {Array}      Peaks found that are greater than the threshold
 */

export function findPeaks(data) {
  let peaks = [];
  let threshold = 0.9;
  const minThresold = 0.3;
  const minPeaks = 15;

  /**
     * Keep looking for peaks lowering the threshold until
     * we have at least 15 peaks (10 seconds @ 90bpm)
     */

  while (peaks.length < minPeaks && threshold >= minThresold) {
    peaks = findPeaksAtThreshold(data, threshold);
    threshold -= 0.05;
  }

  /**
     * Too fiew samples are unreliable
     */

  if (peaks.length < minPeaks) {
    throw (
      new Error('Could not find enough samples for a reliable detection.')
    );
  }

  return peaks;
}

/**
 * Function to identify peaks
 * @param  {Array}  data      Buffer channel data
 * @param  {Number} threshold Threshold for qualifying as a peak
 * @return {Array}            Peaks found that are grater than the threshold
 */

function findPeaksAtThreshold(data, threshold) {
  const peaks = [];

  /**
     * Identify peaks that pass the threshold, adding them to the collection
     */

  for (let i = 0, l = data.length; i < l; i += 1) {
    if (data[i] > threshold) {
      peaks.push(i);

      /**
             * Skip forward ~ 1/4s to get past this peak
             */

      i += 10000;
    }
  }

  return peaks;
}

/**
 * Identify intervals between peaks
 * @param  {Array} peaks Array of qualified peaks
 * @return {Array}       Identifies intervals between peaks
 */

export function identifyIntervals(peaks) {
  const intervals = [];

  peaks.forEach((peak, index) => {
    for (let i = 0; i < 10; i += 1) {
      const interval = peaks[index + i] - peak;

      /**
             * Try and find a matching interval and increase it's count
             */

      const foundInterval = intervals.some((intervalCount) => {
        if (intervalCount.interval === interval) {
          return intervalCount.count += 1;
        }
      });

      /**
             * Add the interval to the collection if it's unique
             */

      if (!foundInterval) {
        intervals.push({
          interval,
          count: 1,
        });
      }
    }
  });

  return intervals;
}

/**
 * Factory for group reducer
 * @param  {Number} sampleRate Audio sample rate
 * @return {Function}
 */

export function groupByTempo(sampleRate) {
  /**
     * Figure out best possible tempo candidates
     * @param  {Array} intervalCounts List of identified intervals
     * @return {Array}                Intervals grouped with similar values
     */

  return (intervalCounts) => {
    const tempoCounts = [];

    intervalCounts.forEach((intervalCount) => {
      if (intervalCount.interval !== 0) {
        /**
                 * Convert an interval to tempo
                 */

        let theoreticalTempo = (60 / (intervalCount.interval / sampleRate));

        /**
                 * Adjust the tempo to fit within the 90-180 BPM range
                 */

        while (theoreticalTempo < 90) theoreticalTempo *= 2;
        while (theoreticalTempo > 180) theoreticalTempo /= 2;

        /**
                 * Round to legible integer
                 */

        theoreticalTempo = Math.round(theoreticalTempo);

        /**
                 * See if another interval resolved to the same tempo
                 */

        const foundTempo = tempoCounts.some((tempoCount) => {
          if (tempoCount.tempo === theoreticalTempo) {
            return tempoCount.count += intervalCount.count;
          }
        });

        /**
                 * Add a unique tempo to the collection
                 */

        if (!foundTempo) {
          tempoCounts.push({
            tempo: theoreticalTempo,
            count: intervalCount.count,
          });
        }
      }
    });

    return tempoCounts;
  };
}
