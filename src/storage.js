module.exports = {
    set: function(key, val) {
        if (!localStorage) return;
        localStorage.setItem(key, JSON.stringify(val));
    },
    get: function(key) {
        if (!localStorage) return;
        try {
            return JSON.parse(localStorage.getItem(key));
        } catch (e) {
            console.error('Couldnt parse', key, 'from storage');
            module.exports.remove(key);
        }
    },
    remove: function(key) {
        if (!localStorage) return;
        localStorage.removeItem(key);
    }
};
