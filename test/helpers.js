function makeEvents(fn){
    return {
        on: fn,
        once: fn
    }
}

module.exports = {
    makeEvents
};