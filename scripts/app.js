APP.Main = ((() => {
    const LAZY_LOAD_THRESHOLD = 300;

    let stories = null;
    let storyStart = 0;
    const count = 20;
    const main = $('main');
    let inDetails = false;
    let storyLoadCount = 0;
    const localeData = {
        data: {
            intl: {
                locales: 'en-US'
            }
        }
    };
    let visibleStoriesLoaded = false;


    let tmplStory = $('#tmpl-story').text();
    let tmplStoryDetails = $('#tmpl-story-details').text();
    let tmplStoryDetailsComment = $('#tmpl-story-details-comment').text();

    if (typeof HandlebarsIntl !== 'undefined') {
        HandlebarsIntl.registerWith(Handlebars);
    } else {

        // Remove references to formatRelative, because Intl isn't supported.
        const intlRelative = /, {{ formatRelative time }}/;
        tmplStory = tmplStory.replace(intlRelative, '');
        tmplStoryDetails = tmplStoryDetails.replace(intlRelative, '');
        tmplStoryDetailsComment = tmplStoryDetailsComment.replace(intlRelative, '');
    }

    const storyTemplate =
        Handlebars.compile(tmplStory);
    const storyDetailsTemplate =
        Handlebars.compile(tmplStoryDetails);
    const storyDetailsCommentTemplate =
        Handlebars.compile(tmplStoryDetailsComment);

    function onStoryData(key, details) {
        requestAnimationFrame(insertStory);
        if (!visibleStoriesLoaded) {
            checkIfVisibleHasLoaded();
        }
        function insertStory() {
            const id = `#s-${key}`;
            const story = $(id);
            details.time *= 1000;
            const html = storyTemplate(details);
            story.html(html);
            story.on('click', onStoryClick.bind(this, details));
            story.addClass('clickable');
            storyLoadCount--;
        }
        function checkIfVisibleHasLoaded() {
            visibleStoriesLoaded = true;
            $('.story')
                .filter((index, element) => $(element).visible(true))
                .each((index, element) => {
                    if (!$(`#${element.id}`).hasClass('clickable')) {
                        visibleStoriesLoaded = false;
                    }
                });
            if (visibleStoriesLoaded) {
                requestAnimationFrame(initColorizeAndScaleStories);
                requestAnimationFrame(initColorizeAndScaleStories);
            }
        }
    }

    function onStoryClick(details) {
        let storyDetails = $(`#sd-${details.id}`);
        // Wait a little time then show the story details.
        setTimeout(showStory.bind(this, details.id), 60);

        // Create and append the story. A visual change...
        // perhaps that should be in a requestAnimationFrame?
        // And maybe, since they're all the same, I don't
        // need to make a new element every single time? I mean,
        // it inflates the DOM and I can only see one at once.
        if (!storyDetails.length) {

            if (details.url) {
                details.urlobj = new URL(details.url);
            }
            let comment;
            let commentsElement;
            let storyHeader;
            let storyContent;

            const storyDetailsHtml = storyDetailsTemplate(details);
            const kids = details.kids;
            const commentHtml = storyDetailsCommentTemplate({
                by: '', text: 'Loading comment...'
            });

            storyDetails = document.createElement('section');
            storyDetails.setAttribute('id', `sd-${details.id}`);
            storyDetails.classList.add('story-details');
            storyDetails.innerHTML = storyDetailsHtml;

            document.body.appendChild(storyDetails);

            commentsElement = storyDetails.querySelector('.js-comments');
            storyHeader = storyDetails.querySelector('.js-header');
            storyContent = storyDetails.querySelector('.js-content');

            const closeButton = storyDetails.querySelector('.js-close');
            closeButton.addEventListener('click', hideStory.bind(this, details.id));

            const headerHeight = storyHeader.getBoundingClientRect().height;
            storyContent.style.paddingTop = `${headerHeight}px`;

            if (typeof kids === 'undefined') {
                return;
            }
            for (let k = 0; k < kids.length; k++) {
                comment = document.createElement('aside');
                comment.setAttribute('id', `sdc-${kids[k]}`);
                comment.classList.add('story-details__comment');
                comment.innerHTML = commentHtml;
                commentsElement.appendChild(comment);

                // Update the comment with the live data.
                APP.Data.getStoryComment(kids[k], commentDetails => {

                    commentDetails.time *= 1000;

                    const comment = commentsElement.querySelector(
                        `#sdc-${commentDetails.id}`);
                    comment.innerHTML = storyDetailsCommentTemplate(
                        commentDetails,
                        localeData);
                });
            }
        }

    }

    function showStory(id) {
        if (inDetails) {
            return;
        }
        inDetails = true;
        $(`#sd-${id}`).addClass('horizTranslate');
        $('body').addClass('details-active');
    }

    function hideStory(id) {
        if (!inDetails) {
            return;
        }
        inDetails = false;
        $(`#sd-${id}`).removeClass('horizTranslate');
        $('body').removeClass('details-active');
    }

    function initColorizeAndScaleStories() {
        const height = main.outerHeight();
        $('.story').each((index, element) => {
            if ($(element).visible(true)) {
                let score;
                let title;
                let scale;
                let opacity;
                let saturation;
                const elementString = `#${element.id}`;

                score = $(elementString).find('.story__score');
                title = $(elementString).find('.story__title');
                const scoreLocation = score.offset().top - $('body').offset().top;
                scale = Math.min(1, 1 - (0.05 * ((scoreLocation - 170) / height)));
                opacity = Math.min(1, 1 - (0.5 * ((scoreLocation - 170) / height)));
                saturation = (100 * ((score.width() - 38) / 2));

                score.width(scale * 40);
                score.height(scale * 40);
                score.css("line-height", `${scale * 40}px`);
                score.css("background-color", `hsl(42, ${saturation}%, 50%)`);
                title.css("opacity", opacity);
            }
        });

        visibleStoriesLoaded = true;
        console.log('initColorizeAndScaleStories() called');
    }

    /**
     * Does this really add anything? Can we do this kind
     * of work in a cheaper way?
     */
    function colorizeAndScaleStories() {
        const height = main.outerHeight();
        $('.story').each((index, element) => {
            if ($(element).visible(true)) {
                let score;
                let title;
                let scale;
                let opacity;
                let saturation;
                const elementString = `#${element.id}`;
                fastdom.measure(() => {
                    score = $(elementString).find('.story__score');
                    title = $(elementString).find('.story__title');
                    const scoreLocation = score.offset().top - $('body').offset().top;
                    scale = Math.min(1, 1 - (0.05 * ((scoreLocation - 170) / height)));
                    opacity = Math.min(1, 1 - (0.5 * ((scoreLocation - 170) / height)));
                    saturation = (100 * ((score.width() - 38) / 2));
                });
                fastdom.mutate(() => {
                    score.width(scale * 40);
                    score.height(scale * 40);
                    score.css("line-height", `${scale * 40}px`);
                    score.css("background-color", `hsl(42, ${saturation}%, 50%)`);
                    title.css("opacity", opacity);
                });
            }
        });
    }

    main.on('scroll', update); // could use debounce here, but the update in well inside the 16ms window

    function update() {
        colorizeAndScaleStories();

        fastdom.measure(() => {
            const scrollHeight = main.scrollHeight;
            const offsetHeight = main.offsetHeight;
            const scrollTopCapped = Math.min(70, main.scrollTop);
            const scaleString = `scale(${1 - (scrollTopCapped / 300)})`;

            fastdom.mutate(() => {
                $('.header').height(156 - scrollTopCapped);
                $('.header__title-wrapper').css({
                    '-webkit-transform': scaleString,
                    '-moz-transform': scaleString,
                    '-ms-transform': scaleString,
                    '-o-transform': scaleString,
                    'transform': scaleString
                });
                // Add a shadow to the header.
                if (scrollTopCapped > 70) {
                    $('body').addClass('raised');
                } else {
                    $('body').removeClass('raised');
                }

                // Check if we need to load the next batch of stories.
                const loadThreshold = (scrollHeight - offsetHeight - LAZY_LOAD_THRESHOLD);
                if (scrollTopCapped > loadThreshold) {
                    loadStoryBatch();
                }
            });
        });
    }

    function loadStoryBatch() {

        if (storyLoadCount > 0) {
            return;
        }
        storyLoadCount = count;

        const end = storyStart + count;
        for (let i = storyStart; i < end; i++) {

            if (i >= stories.length) {
                return;
            }
            const key = String(stories[i]);
            const story = document.createElement('div');
            story.setAttribute('id', `s-${key}`);
            story.classList.add('story');
            story.innerHTML = storyTemplate({
                title: '...',
                score: '-',
                by: '...',
                time: 0
            });
            main.append(story);

            APP.Data.getStoryById(stories[i], onStoryData.bind(this, key));
        }
        storyStart += count;
    }

    APP.Data.getTopStories(data => {
        stories = data;
        loadStoryBatch();
        $('main').removeClass('loading');
    });


}))();
