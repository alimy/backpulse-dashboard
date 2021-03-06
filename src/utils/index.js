export const copy = text => {
    const el = document.createElement('textarea');
    el.id = "dummy";
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
}

export const getTheme = () => {
    const theme = localStorage.getItem("theme");
    if (theme === "light") return "light";
    return "dark";
}

export const toggleTheme = () => {
    const theme = getTheme();
    if (theme === "dark") {
        localStorage.setItem("theme", "light");
    } else {
        localStorage.setItem("theme", "dark");
    }
}

export const getLanguage = () => {
    const navigatorLang = navigator.language.substr(0, 2);
    let lang = localStorage.getItem("language") || navigatorLang;
    if (lang !== "fr" && lang !== "en") {
        lang = "en";
    }
    return lang;
}

export const setLanguage = lang => {
    localStorage.setItem("language", lang);
    window.dispatchEvent(new CustomEvent("language"), {
        detail: {
            language: lang
        }
    });
}

export function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

export function toTitleCase(str) {
    return str.replace(
        /\w\S*/g,
        function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}

export const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
};

export const sortByIndex = array => {
    return array.sort(function(a, b){return a.index - b.index});
}

export const youtubeParser = url => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match&&match[7].length===11)? match[7] : false;
}