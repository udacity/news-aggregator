onmessage = function (e) {
    console.log('Message received from main script');
    var url = e.data[0];
    //var callback = e.data[1];
    request (url);

    function request(url) {
        console.log ('inside request function in worker');
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'json';
        xhr.onload = transferComplete;
        xhr.send();
    }

    function transferComplete(evt) {
        postMessage(evt.target.response);
        console.log("The transfer is complete.");
    }
}