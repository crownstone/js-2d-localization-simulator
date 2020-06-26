class EventBusClass {

  constructor() {
    this._topics = {};
    this._topicIds = {};
  }

  on(topic, callback) {
    if (!(topic)) {
      console.warn('Attempting to subscribe to undefined topic:', topic);
      return;
    }
    if (!(callback)) {
      console.warn('Attempting to subscribe without callback to topic:', topic);
      return;
    }

    if (this._topics[topic] === undefined)
      this._topics[topic] = [];

    // generate unique id
    let id = (Math.random() * 1e8).toString(36) + '-' + (Math.random() * 1e8).toString(36)


    this._topics[topic].push({id, callback});
    this._topicIds[id] = true;

    // return unsubscribe function.
    return () => {
      if (this._topics[topic] !== undefined) {
        // find id and delete
        for (let i = 0; i < this._topics[topic].length; i++) {
          if (this._topics[topic][i].id === id) {
            this._topics[topic].splice(i, 1);
            break;
          }
        }

        // clear the ID
        this._topicIds[id] = undefined;
        delete this._topicIds[id];

        if (this._topics[topic].length === 0) {
          delete this._topics[topic];
        }

        // console.info('Something with ID ', id, ' unsubscribed from ', topic);
      }
    };
  }

  emit(topic, data) {
    if (this._topics[topic] !== undefined) {
      // Firing these elements can lead to a removal of a point in this._topics.
      // To ensure we do not cause a shift by deletion (thus skipping a callback) we first put them in a separate Array
      let fireElements = [];

      for (let i = 0; i < this._topics[topic].length; i++) {
        fireElements.push(this._topics[topic][i]);
      }

      for (let i = 0; i < fireElements.length; i++) {
        // this check makes sure that if a callback has been deleted, we do not fire it.
        if (this._topicIds[fireElements[i].id] === true) {
          fireElements[i].callback(data);
        }
      }
    }
  }


  clearAllEvents() {
    this._topics = {};
    this._topicIds = {};
  }
}

