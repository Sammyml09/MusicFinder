import { loadCommentSection, saveComments } from "./comments.js"; 

export async function searchAlbum() {
    loadCommentSection()
    var artistSelected = localStorage.getItem('artistSelected');
    var albumSelected = localStorage.getItem('albumSelected');
    const albumName = albumSelected;
    const artistName = artistSelected;
    const url = `https://musicbrainz.org/ws/2/release/?query=release:${albumName}%20AND%20artist:${artistName}&limit=1&fmt=json`;
    
    try {
        const response = await fetch(url);
        const data = await response.json()
        const trackList = document.getElementById('trackList');
        trackList.innerHTML = '<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>';
        if (data.releases && data.releases.length > 0) {
            const releaseId = data.releases[0].id;
            const releaseUrl = `https://musicbrainz.org/ws/2/release/${releaseId}?inc=recordings&fmt=json`;
            const releaseResponse = await fetch(releaseUrl);
            const releaseData = await releaseResponse.json();
            
            console.log(releaseData);  // Log data to see what is inside
            
            if (releaseData.title) {
                trackList.innerHTML = `<h2>${releaseData.title}</h2>`;
                if (releaseData.media && releaseData.media[0].tracks) {
                    releaseData.media[0].tracks.forEach(track => {
                        trackList.innerHTML += `<p>${track.position}. ${track.title}</p>`;
                    });
                } else {
                    trackList.innerHTML += '<p>No tracks found.</p>';
                }
            } else {
                trackList.innerHTML = '<p>No valid album data found.</p>';
            }
        } else {
            trackList.innerHTML = '<p>No results found.</p>';
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('trackList').innerHTML = '<p>An error occurred while fetching the data. Please try again.</p>';
    }
}