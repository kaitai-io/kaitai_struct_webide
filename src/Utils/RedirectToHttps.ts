export const redirectToHttps = () => {
    const host = process.env.HOST;
    if (window.location.href.match(`http://${host}`)) {
        window.location.protocol = "https:";
    }
};