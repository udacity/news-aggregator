APP.Data = ((() => {

    const HN_API_BASE = 'https://hacker-news.firebaseio.com';
    const HN_TOPSTORIES_URL = `${HN_API_BASE}/v0/topstories.json`;
    const HN_STORYDETAILS_URL = `${HN_API_BASE}/v0/item/[ID].json`;

    function getTopStories(callback) {
        let myWorker = new Worker('scripts/requestWorker.js');
        myWorker.onmessage = function (e) {
            var result = e.data;
            console.log('Message received from worker');
            callback(result);
        }
        myWorker.postMessage([HN_TOPSTORIES_URL]);
    }

    function getStoryById(id, callback) {
        let myWorker = new Worker('scripts/requestWorker.js');
        myWorker.onmessage = function (e) {
            var result = e.data;
            console.log('Message received from worker');
            callback(result);
        }
        const storyURL = HN_STORYDETAILS_URL.replace(/\[ID\]/, id);
        myWorker.postMessage([storyURL]);
    }

    function getStoryComment(id, callback) {
        let myWorker = new Worker('scripts/requestWorker.js');
        myWorker.onmessage = function (e) {
            var result = e.data;
            console.log('Message received from worker');
            callback(result);
        }
        const storyCommentURL = HN_STORYDETAILS_URL.replace(/\[ID\]/, id);
        myWorker.postMessage([storyCommentURL]);
    }

    return {
        getTopStories,
        getStoryById,
        getStoryComment
    };

}))();

