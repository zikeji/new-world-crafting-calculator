export default () => {
    if (process.env.VUE_APP_MATAMO_URL && process.env.VUE_APP_MATAMO_SITEID) {
        window._paq = window._paq || [];
        window._paq.push(['trackPageView']);
        window._paq.push(['enableLinkTracking']);
        let u=`//${process.env.VUE_APP_MATAMO_URL}/`;
        window._paq.push(['setTrackerUrl', `${u}${process.env.VUE_APP_MATAMO_FILE ?? 'matomo'}.php`]);
        window._paq.push(['setSiteId', process.env.VUE_APP_MATAMO_SITEID]);
        const target = document.getElementsByTagName('script')[0];
        const script = document.createElement('script');
        script.async=true;
        script.src=`${u}${process.env.VUE_APP_MATAMO_FILE ?? 'matomo'}.js`;
        target.parentNode.insertBefore(script, target);
    }
}