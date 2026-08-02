import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import axios from 'axios';

const socket = io('http://localhost:5000');

const Consultation = ({ bookingId, userId, isDoctor }) => {
    const [stream, setStream] = useState(null);
    const [peer, setPeer] = useState(null);
    const [diagnosis, setDiagnosis] = useState('');
    const [prescription, setPrescription] = useState('');
    const [notes, setNotes] = useState('');
    const videoRef = useRef();
    const peerVideoRef = useRef();

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
                setStream(stream);
                videoRef.current.srcObject = stream;

                socket.emit('join-consultation', { bookingId, userId });

                const peer = new Peer({ initiator: isDoctor, stream });
                setPeer(peer);

                peer.on('stream', (peerStream) => {
                    peerVideoRef.current.srcObject = peerStream;
                });

                socket.on('signal', (data) => {
                    if (data.userId !== userId) {
                        peer.signal(data.signal);
                    }
                });
            });

        return () => {
            stream?.getTracks().forEach(track => track.stop());
            socket.off('signal');
        };
    }, [bookingId, userId, isDoctor]);

    const handleSignal = (signal) => {
        socket.emit('signal', { bookingId, userId, signal });
    };

    const saveNotes = async () => {
        if (isDoctor) {
            await axios.post('http://localhost:5000/api/v1/medical-notes', {
                bookingId,
                doctorId: userId,
                userId: bookingId.user,
                diagnosis,
                prescription,
                notes
            });
        }
    };

    return (
        <div>
            <h2>Consultation</h2>
            <video ref={videoRef} autoPlay muted />
            <video ref={peerVideoRef} autoPlay />
            {isDoctor && (
                <div>
                    <textarea
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        placeholder="Diagnosis"
                    />
                    <textarea
                        value={prescription}
                        onChange={(e) => setPrescription(e.target.value)}
                        placeholder="Prescription"
                    />
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Additional Notes"
                    />
                    <button onClick={saveNotes}>Save Medical Notes</button>
                </div>
            )}
        </div>
    );
};

export default Consultation;