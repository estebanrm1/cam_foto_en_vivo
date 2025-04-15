import { useEffect, useRef, useState } from 'react';
import './index.css';


function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [photoSent, setPhotoSent] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    startCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error al acceder a la cámara:', err);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    stopCamera();

    // Mostrar imagen como preview
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    setPreviewUrl(imageDataUrl);
  };

  const retryPhoto = () => {
    setPreviewUrl(null);
    setComment('');
    startCamera();
  };

  const handleUpload = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg')
    );

    const formData = new FormData();
    formData.append('image', blob, 'captured.jpg');
    formData.append('comment', comment);

    try {
      await fetch('https://backend-fv.onrender.com/api/photos', {
        method: 'POST',
        body: formData,
      });
      setPhotoSent(true);
    } catch (err) {
      console.error('Error al enviar la foto:', err);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center text-white text-center px-4">
      {!photoSent ? (
        <>
          {!previewUrl ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full max-w-md rounded-xl shadow-lg"
              />
              <button onClick={takePhoto} className="btn py-5 my-5">
                <strong>¡Sacar Foto!</strong>
                <div id="container-stars">
                  <div id="stars"></div>
                </div>
                <div id="glow">
                  <div class="circle"></div>
                  <div class="circle"></div>
                </div>
              </button>
            </>
          ) : (
            <>
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full max-w-md rounded-xl shadow-lg"
              />
              <textarea
                placeholder="Dejá tu mensaje (opcional)"
                className="mt-4 w-full max-w-md p-3 rounded bg-purple-500"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <div className="flex-column mt-4">
                <button
                  onClick={handleUpload}
                  className="btn mb-3 py-5"
                >
                <strong>Enviar</strong>
                <div id="container-stars">
                  <div id="stars"></div>
                </div>
                <div id="glow">
                  <div class="circle"></div>
                  <div class="circle"></div>
                </div>
                </button>
                <button
                  onClick={retryPhoto}
                  className="btn py-5 me-2"
                >
                  <strong>Volver a intentar</strong>
                <div id="container-stars">
                  <div id="stars"></div>
                </div>
                <div id="glow">
                  <div class="circle"></div>
                  <div class="circle"></div>
                </div>
                </button>
              </div>
            </>
          )}
        </>
      ) : (
        <div className="text-2xl text-red-400 font-bold bg-white-500/50">
          ¡Gracias! Tu foto se está mostrando en pantalla 🎉
        </div>
      )}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
}

export default App;


