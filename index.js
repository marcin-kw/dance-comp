(function() {
    'use strict';

    function showContent() {
        document.getElementById('LoadMessage').style.display = 'none';
        $('#block_menu')[0].style.visibility = 'visible';
        $('#block_menu')[0].style.position = '';
        $('#block_menu')[0].style.top = '';
        $('#block_menu')[0].style.left = '';

        // remove dumb paragraphs
        var parags = $('#block_menu p')
        if (parags[3]) {
            parags[3].parentNode.removeChild(parags[3]);
        }
        if (parags[2]) {
            parags[2].parentNode.removeChild(parags[2]);
        }
        
    }

    // Your code here...
    function loadCompManagerData(data) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, 'text/html');
        var additionalContent = doc.body.innerHTML;
        document.body.insertAdjacentHTML('beforeend', additionalContent);
        showContent();
    }

    var compMgrResponse;
    fetch('https://dance-comp-improver-5248baad7892.herokuapp.com/https://www.comp-mngr.com/canamgala23/canamgala23_HeatLists.htm', {
        //'https://cors-anywhere.herokuapp.com/https://www.comp-mngr.com/northstar2023/NorthStar2023_HeatLists.htm', {
        method: 'GET',
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'en-US,en;q=0.9,pl;q=0.8',
            'Host': 'www.comp-mngr.com',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
        }
    })
    .then(response => response.text())  // or response.json() if the response is JSON
    .then(data => {
        console.log(data);
        loadCompManagerData(data);

    })
    .catch(error => {
        console.error('Error:', error);
    });
})();
