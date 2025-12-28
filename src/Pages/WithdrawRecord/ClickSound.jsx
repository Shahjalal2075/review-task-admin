import React, { useEffect, useState } from 'react';

const ClickSound = () => {
    const [hasInteracted, setHasInteracted] = useState(false);

    const handleUserInteraction = () => {
        setHasInteracted(true);
    };

    useEffect(() => {
        let intervalId;
        let dataLength = 0;
        const fetchData = async () => {
            try {
                const response = await fetch('https://server.amazonkindlerating.com/withdraw');
                const data = await response.json();

                if (data.length > dataLength && hasInteracted) {
                    console.log(data.length);
                    console.log(dataLength);
                    dataLength = data.length;
                    console.log(dataLength);
                    const audio = new Audio('/notufy.wav');
                    audio.play();
                }

            } catch (err) {
                console.error("Auto-fetch failed:", err);
            }
        };

        fetchData();
        intervalId = setInterval(fetchData, 3000);

        return () => clearInterval(intervalId);
    }, [hasInteracted]);

    return (
        <div>
            <button onClick={handleUserInteraction}>Enable Sound</button>
        </div>
    );
};

export default ClickSound;
