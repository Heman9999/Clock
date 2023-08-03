import './App.scss';
import { useState,useRef,useEffect } from 'react';
import Music from './music/1Beep.mp3'

const accurateInterval = function (fn, time) {
    var cancel, nextAt, timeout, wrapper;
    nextAt = new Date().getTime() + time;
    timeout = null;
    wrapper = function () {
        nextAt += time;
        timeout = setTimeout(wrapper, nextAt - new Date().getTime());
        return fn();
    };
    cancel = function () {
        return clearTimeout(timeout);
    };
    timeout = setTimeout(wrapper, nextAt - new Date().getTime());
    return {
        cancel: cancel
    };
};
function App() {
  return (
    <div id="app">
      <Clock />
    </div>
  );
}


function Clock() {
    const BREAK_LENGTH = 5;
    const SESSION_LENGTH = 25;

    const [started, setStarted] = useState(false);

    const [breakLength, setBreakLength] = useState(BREAK_LENGTH);
    const [sessionLength, setSessionLength] = useState(SESSION_LENGTH);

    const [activeClock, setActiveClock] = useState("S");

    const [reset, setReset] = useState(0);

    return (
        <div className="clock">
            <div className="title">25 + 5 Clock</div>
            <div className="length-setters">
                <LengthSetter
                    type="break"
                    disabled={started}
                    label="Break Length"
                    length={breakLength}
                    setter={setBreakLength}
                />
                <LengthSetter
                    type="session"
                    disabled={started}
                    label="Session Length"
                    length={sessionLength}
                    setter={setSessionLength}
                />
            </div>
            <Display
                {...{
                    started,
                    reset,
                    activeClock,
                    setActiveClock,
                    breakLength,
                    sessionLength
                }}
            />
            <Controls {...{ setStarted, onReset: handleReset }} />
        </div>
    );

    function handleReset() {
        setBreakLength(BREAK_LENGTH);
        setSessionLength(SESSION_LENGTH);
        setActiveClock("S");
        setReset(reset + 1);
        setStarted(false);
        {
          let a = document.getElementById('beep')
          a.pause()
        }
    }
}

function LengthSetter({ type, label, length, setter, disabled }) {
    const labelId = type + "-label";
    const decrementId = type + "-decrement";
    const incrementId = type + "-increment";
    const lengthId = type + "-length";

    return (
        <div className="length-setter">
            <div id={labelId} className="label">
                {label}
            </div>
            <button id={decrementId} onClick={decrement}>
              Dec
            </button>
            <span id={lengthId}>{length}</span>
            <button id={incrementId} onClick={increment}>
                Inc
            </button>
        </div>
    );

    function decrement() {
        if (disabled) {
            return;
        }

        if (length > 1) {
            setter(length - 1);
        }
    }

    function increment() {
        if (disabled) {
            return;
        }

        if (length < 60) {
            setter(length + 1);
        }
    }
}

function Display({
    started,
    reset,
    activeClock,
    setActiveClock,
    sessionLength,
    breakLength
}) {
    const audioRef = useRef();

    const [timer, setTimer] = useState(
        (activeClock === "S" ? sessionLength : breakLength) * 60
    );

    useEffect(() => {
        if (started) {
            const interval = accurateInterval(countDown, 1000);

            return function cleanup() {
                interval.cancel();
            };
        }
    }, [started]);

    useEffect(() => {
        setTimer(sessionLength * 60);
    }, [sessionLength]);

    useEffect(() => {
        setTimer((activeClock === "S" ? sessionLength : breakLength) * 60);
    }, [activeClock]);

    useEffect(() => {
        const audioEl = audioRef.current;
        audioEl.pause();
        audioEl.currentTime = 0;
    }, [reset]);

    return (
        <div className="display">
            <div id="timer-label">
                {activeClock === "S" ? "Session" : "Break"}
            </div>
            <div id="time-left" className="time-left">
                {clockStart()}
            </div>
            <audio
                id="beep"
                preload="auto"
                ref={audioRef}
                src={Music}
            />
        </div>
    );

    function countDown() {
        setTimer((prevTimer) => {
            if (prevTimer > 0) {
                return prevTimer - 1;
            } else if (prevTimer === 0) {
                setActiveClock((ac) => (ac === "S" ? "B" : "S"));
                const audioEl = audioRef.current;
                audioEl.play();

                return prevTimer;
            } else {
                throw Error(`Timer ${prevTimer} should not happen`);
            }
        });
    }

    function clockStart() {
        const SECONDS_IN_MINUTES = 60;
        let minutes = Math.floor(timer / SECONDS_IN_MINUTES);
        let seconds = timer - minutes * SECONDS_IN_MINUTES;

        minutes = (minutes < 10 ? "0" : "") + minutes;
        seconds = (seconds < 10 ? "0" : "") + seconds;

        return minutes + ":" + seconds;
    }
}

function Controls({ setStarted, onReset }) {
    return (
        <div className="controls">
            <button
                id="start_stop"
                className="start-stop"
                onClick={handleStartStop}
            >
                Play/Pause
            </button>
            <button id="reset" className="reset" onClick={onReset}>
                Reset
            </button>
        </div>
    );

    function handleStartStop() {
        setStarted((started) => !started);
    }
}

export default App;
