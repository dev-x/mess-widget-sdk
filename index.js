import sailsIOClient from 'sails.io.js';
import socketIOClient from 'socket.io-client';


export default class WidgetSDK {
  constructor({ url, onConnect }) {
    if (!url) {
      console.log('SDK FATAL ERROR URL IS UNDEFINED')
    }
    let io;
    if (socketIOClient.sails) {
      io = socketIOClient;
    } else {
      io = sailsIOClient(socketIOClient);
    }
    io.sails.url = url
    io.sails.useCORSRouteToGetCookie = false
    io.socket.on('connect', function (msg) {
      onConnect(msg);
    });
    io.sails.autoConnect = true
    io.sails.transports = ['polling']
    this.io = io;
    this.options = { url: url };
    this.onMessage = function () { };
    this.inited = false;
    this.anonymous_session = null;
  }

  init(options, cb) {
    this.onMessage = options.onMessage;
    this.onWidgetEvent = options.onWidgetEvent;
    this.io.socket.post('/api/widget/init', { email: options.email, app_id: options.app_id }, (resData, error) => {
      console.log('Init done', resData, error)
      if (resData && resData.status == 'ok') {
        this.inited = true;
        this.anonymous_session = resData.anonymous_session;
        cb(resData, null)
      } else {
        cb(null, resData)
      }
    });

    this.io.socket.on('admin_event', (data) => {
      this.onWidgetEvent(data);
    })

    this.io.socket.on('message', (msg) => {
      this.onMessage(msg);
    })
  }

  ping(empty, cb) {
    if (this.inited && this.anonymous_session) {
      this.io.socket.get('/api/widget/ping', function (resData, jwres) {
        console.log('/api/widget/ping', resData);
        if (resData) {
          cb(resData, null)
        } else {
          cb(null, resData)
        }
      });
    } else cb(null, { message: 'not inited' })
  }

  message(message, cb) {
    if (this.inited && this.anonymous_session) {
      this.io.socket.post('/api/widget/message', message, function (resData, jwres) {
        if (resData && resData.status == 'ok') {
          cb(resData.message, null)
        } else {
          cb(null, resData)
        }
      });
    }
  }

  conversations(empty, cb) {
    if (this.inited && this.anonymous_session) {
      this.io.socket.get('/api/widget/conversations', function (resData, jwres) {
        console.log('/api/widget/conversations', resData);
        if (resData && resData.status == 'ok') {
          cb(resData.conversations, null)
        } else {
          cb(null, resData)
        }
      });
    } else cb(null, { message: 'not inited' })
  }

  read_conversation(conversation_id, cb) {
    if (this.inited && this.anonymous_session) {
      this.io.socket.post('/api/widget/read', { conversation_id }, function (resData, jwres) {
        console.log('/api/widget/read', resData);
        if (resData) {
          cb(resData, null)
        } else {
          cb(null, resData)
        }
      });
    }
  }

  fetch_conversation(conversation_id, cb) {
    if (this.inited && this.anonymous_session) {
      this.io.socket.post('/api/widget/fetch', { conversation_id }, function (resData, jwres) {
        console.log('/api/widget/fetch', resData);
        if (resData) {
          cb(resData, null)
        } else {
          cb(null, resData)
        }
      });
    }
  }

  upload_file(form, cb) {
    if (this.inited && this.anonymous_session) {
      fetch(this.options.url + "/api/widget/upload", {
        method: "POST",
        body: form
      }).then(responce => responce.json()).then((data) => {
        cb(data, null)
      }).catch(error => {
        cb(null, error)
      })
    }
  }

  ping(empty, cb) {
    if (this.inited && this.anonymous_session) {
      this.io.socket.get('/api/widget/ping', function (resData, jwres) {
        console.log('/api/widget/ping', resData);
        if (resData) {
          cb(resData, null)
        } else {
          cb(null, resData)
        }
      });
    } else cb(null, { message: 'not inited' })
  }

  capture(formData, cb) {
    if (this.inited && this.anonymous_session) {
      this.io.socket.post('/api/widget/capture', formData, function (resData, jwres) {
        console.log('/api/widget/capture', resData);
        if (resData) {
          cb(resData, null)
        } else {
          cb(null, resData)
        }
      });
    } else cb(null, { message: 'not inited' })
  }

  sendEvent(body) {
    if (this.inited && this.anonymous_session) {
      this.io.socket.post('/api/widget/notification_event', body, function (resData, jwres) {
        console.log('/api/widget/sendEvent', resData);
        if (resData) {
          cb(resData, null)
        } else {
          cb(null, resData)
        }
      });
    } else cb(null, { message: 'not inited' })

  }
}
