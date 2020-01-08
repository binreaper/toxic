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
let searchValue = '';

function main() {
    const searchInput = document.querySelector('#search-input');
    searchInput.addEventListener('keyup', debouncedSearchHandler);
}

function addToPlaylist() {

}

function removeFromPlaylist() {

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
    if(e.target.value === searchValue){
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
  searchList.forEach(item=>{
    const listItem = document.createElement('li');
    listItem.innerHTML = item.title;
    searchListContainer.appendChild(listItem);
  });

}

function playAudio() {

}

function pauseAudio() {

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




main();