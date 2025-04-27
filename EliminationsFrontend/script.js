document.addEventListener('DOMContentLoaded', function () {
    let previousData = null;
    let uniqueValueSet = new Set();
    let tempArr = [];
    let audioQueue = [];
    let isPlaying = false;
    let eliminatedList = document.getElementById('eliminated-list');
    let playingList = document.getElementById('playing-list');
    let player = document.getElementById('audioPlayer');



    async function maaKiChoot(){
        async function updateLatestData() {
            try {
                // let newData = ['SG001', 'SG002', 'SG003', 'SG004', 'SG005'];
                let response = await fetch('http://localhost:8000');
                let newData = await response.json();               
    
                if (JSON.stringify(newData) !== JSON.stringify(previousData)) {
                    previousData = newData;
                    newData.forEach(element => {
                        if (!uniqueValueSet.has(element)) {
                            uniqueValueSet.add(element);
                            const li = document.createElement('li');
                            li.classList.add('list-group-item', 'text-center');
                            li.textContent = element;
                            eliminatedList.appendChild(li);
                            audioQueue.push(element);
                            addToPlaylist(element)
                        }
                    });
                }
            } catch (e) {
                console.error(`Error while getting data: ${e}`);
            }
            listUpdateHandler();
        }
    
        async function playFromQueue(arr) {
            if (arr.length === 0 || isPlaying) return;
            while (arr.length > 0) {
                isPlaying = true;
                let fileToPlay = `audio/${arr.shift()}.mp3`;
                player.src = fileToPlay;
                updatePlayingList(fileToPlay, true);
                try {
                    await player.play();
                    await new Promise(resolve => player.onended = resolve);
                    console.log(`Playing ${fileToPlay} finished`);
                    updatePlayingList(fileToPlay, false);
                } catch (error) {
                    console.error(`Failed to play audio: ${error}`);
                    break;
                }
            }
            isPlaying = false;
        }
    
        function listUpdateHandler(){
            if (audioQueue.length > 0 && !isPlaying) {
                tempArr = audioQueue;
                audioQueue = []
                playFromQueue(tempArr)
            }
        }
    
        function addToPlaylist(elem){
            const li = document.createElement('li')
            li.id = `audio/${elem}.mp3`;
            li.textContent = elem;
            li.classList.add('list-group-item', 'text-center');
            playingList.appendChild(li)
        }
    
        function updatePlayingList(id, isActive) {
            let currentlyPlaying = document.getElementById(id);
            if(isActive){
                currentlyPlaying.classList.add('active')
            }else{
                currentlyPlaying.remove();
            }
        }


        updateLatestData();
        setInterval(updateLatestData, 3000);
    }

    document.addEventListener('click', function userInteractionHandler() {
        maaKiChoot();
        document.removeEventListener('click', userInteractionHandler);
    });

});
