(function() {
    const audioRef = document.querySelector('audio');
    const APIURL = 'https://orion-server.herokuapp.com';


    const validRepeatModes = createFixedStateObject(['ALL', 'CURRENT', 'NONE']);
    const validAudioStates = createFixedStateObject(['PLAYING', 'PAUSED']);

    const debouncedSearchHandler = debounce(searchHandler, 250);

    let repeatMode = validRepeatModes.NONE;
    let audioState = validAudioStates.PAUSED;
    let playlist = [];
    let searchList = [];
    let shuffleAudio = false;
    let currentTrackIndex = null;
    let searchValue = '';

    function main() {
        const searchInput = document.querySelector('#search-input');
        searchInput.addEventListener('keyup', debouncedSearchHandler);
        readStorage();
        renderPlaylist();
        initPlayerControls();
    }

    function addToPlaylist(item) {
        playlist.push(item);

        if (playlist.length === 1) {
            playSource(item, 0);
        }

        writeStorage();
        updatePlaylist();
    }

    function updatePlayer(audioItem, index) {
        const trackNameContainer = document.querySelector("#track-name");
        trackNameContainer.innerHTML = audioItem.title;
        currentTrackIndex = index;
    }

    function removeFromPlaylist(removalIndex) {
        playlist.splice(removalIndex, 1);
        updatePlaylist();
    }

    function search(searchTerm) {
        const waitingFor = searchTerm;
        const url = APIURL + '/api/search?searchTerm=' + searchTerm;
        return axios.get(url)
            .then(data => {
                if (waitingFor === searchTerm) {
                    return data.data
                }
            });

    }

    function searchHandler(e) {
        if (e.target.value === searchValue) {
            return;
        }

        if (e.target.value.length < 3) {
            return;
        }

        searchValue = e.target.value;

        return search(e.target.value)
            .then(data => {
                searchList = data;
                renderSearchList();
            })
            .catch(err => {
                httpErrorHandler(err);
            });
    }

    function renderSearchList() {
        const searchListContainer = document.querySelector('#search-list');
        searchListContainer.innerHTML = '';

        searchList.forEach(item => {
            const listItem = document.createElement('div');
            listItem.innerHTML = item.title;
            listItem.classList.add('m-sm');
            listItem.classList.add('list-item');
            listItem.addEventListener('click', () => {
                addToPlaylist(item);
            });
            searchListContainer.appendChild(listItem);
        });

    }

    function renderPlaylist() {
        const playlistContainer = document.querySelector('#playlist');
        playlistContainer.innerHTML = '';
        playlist.forEach((item, index) => {
            const listItem = createRow();
            const columnOne = createColumn('column-75');
            const columnTwo = createColumn('column-25');
            const button = document.createElement('button');
            const p = document.createElement('p');

            p.innerText = item.title;
            p.addEventListener('click', () => {
                playSource(item, index);
            });

            button.innerText = 'Remove';
            button.addEventListener('click', () => removeFromPlaylist(index));
            button.classList.add('button-black');
            button.classList.add('button-clear');

            columnOne.appendChild(p);
            columnTwo.appendChild(button);

            listItem.appendChild(columnOne);
            listItem.appendChild(columnTwo);

            playlistContainer.appendChild(listItem);
        });
    }

    function playSource(item, index) {
        audioRef.src = APIURL + '/api/play?audioId=' + item.videoId;
        updatePlayer(item, index);
        playAudio();
    }

    function playAudio() {
        audioRef.play();
    }

    function pauseAudio() {
        audioRef.pause();
    }

    function changeAudioState(playState) {
        if (validAudioStates.isValid(playState)) {
            audioState = playState;
        }
    }

    function changeRepeatMode() {
        const repeatFlow = ['ALL', 'CURRENT', 'NONE'];

        let nextStateIndex = repeatFlow.indexOf(repeatMode) + 1;
        if (nextStateIndex >= repeatFlow.length) {
            nextStateIndex = 0;
        }
        const nextState = repeatFlow[nextStateIndex];

        if (validRepeatModes.isValid(nextState)) {
            repeatMode = nextState;
        }
    }

    function httpErrorHandler(err) {
        console.log(err);
    }

    function updatePlaylist() {
        renderPlaylist();
        writeStorage();
    }

    function initPlayerControls() {
        const buttonMappings = {
            'play': playAudio,
            'pause': pauseAudio,
            'next': playNext,
            'previous':playPrevious
        };

        const playerControlsContainer = document.querySelector('#player-controls');
        const buttons = playerControlsContainer.querySelectorAll('button');

        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                buttonMappings[button.attributes['aria-label'].value]()
            });
        });
    }

    function createRow() {
        const row = document.createElement('div');
        row.classList.add('row');
        return row;
    }

    function createColumn(customSizing) {
        const column = document.createElement('div');
        column.classList.add('column')
        if (customSizing) {
            column.classList.add(customSizing);
        }
        return column;
    }

    function readStorage() {
        const data = window.localStorage.getItem('tracks');
        if (data) {
            const decoded = JSON.parse(atob(data));
            playlist = decoded;
        }
    }

    function writeStorage() {
        const encoded = btoa(JSON.stringify(playlist));
        window.localStorage.setItem('tracks', encoded);
    }

    function playNext() {
        const nextTrack = playlist[currentTrackIndex + 1];
        if (nextTrack) {
            playSource(nextTrack, currentTrackIndex + 1);
        }
    }

    function playPrevious() {
        const prevTrack = playlist[currentTrackIndex - 1];
        if (prevTrack) {
            playSource(prevTrack, currentTrackIndex - 1);
        }
    }

    main();
})();