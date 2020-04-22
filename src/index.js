const LOG = (...msgs) => {
    const formatMsg = msg => {
        if (typeof msg === 'object') {
            return JSON.stringify(msg, undefined, 2);
        }
        return msg;
    };
    const logEl = document.querySelector('.main__log');
    const getRowEl = msg => {
        const el = document.createElement('div');
        el.classList.add('main__log-row');
        const formattedMsg = formatMsg(msg);
        el.innerHTML = formattedMsg;

        return el;
    };

    const rows = msgs.map(getRowEl);

    rows.forEach(row => logEl.appendChild(row));
};

const setup = () => {
    LOG('TEST LOG PLEASE IGNORE.');
};

setup();
