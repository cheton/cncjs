/* eslint jsx-a11y/media-has-caption: 0 */
import { Box } from '@tonic-ui/react';
import React, { useEffect, useRef, useState } from 'react';

function stopStream(stream) {
  if (!stream) {
    return;
  }
  if (stream.getTracks) {
    stream.getTracks().forEach(track => track.stop());
  } else if (stream.stop) {
    stream.stop();
  }
}

/**
 * @param {{ audio?: boolean|string, video?: boolean|string, [key: string]: unknown }} props
 */
function Webcam({ audio = true, video = true, ...props }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const requestRef = useRef(0);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    const getUserMedia = navigator.mediaDevices?.getUserMedia;
    if (!getUserMedia) {
      return undefined;
    }
    const request = ++requestRef.current;
    getUserMedia.call(navigator.mediaDevices, { audio: !!audio, video: video || true }).then(nextStream => {
      if (request !== requestRef.current) {
        stopStream(nextStream);
      } else {
        stopStream(streamRef.current);
        streamRef.current = nextStream;
        setStream(nextStream);
      }
    }).catch(() => {});
    return () => {
      requestRef.current += 1;
      stopStream(streamRef.current);
      streamRef.current = null;
    };
  }, [audio, video]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return <Box as="video" {...props} ref={videoRef} />;
}

export default Webcam;
