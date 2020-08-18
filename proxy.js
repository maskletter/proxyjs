(function(global, factory){
  typeof exports === 'object' && typeof module !== 'undefined' ? eachMethod(module.exports, factory()) :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, eachMethod(global, factory()));
  
  function eachMethod(item,data) {
    for(var key in data) {
      item[key] = data[key]
    }
  }

}(this, function() {
  function FormatPath(array) {
    let str = '';
    array.forEach(v => {
        if(isNaN(v)) {
            str += '.'+v;
        } else {
            str += `[${v}]` 
        }
    })
    return str.substr(1)
  }
  
  function createData(value) {
    return value instanceof Array ? [...value] : { ...value };
  }
  
  function WatchEvent(parentWatchEvent) {
    this.eventList = [];
    this.parentEvent = [];
    if(parentWatchEvent) {
        this.parentEvent = [...parentWatchEvent.parentEvent, parentWatchEvent]
    }
  }
  WatchEvent.prototype.find = function() {
    let event = [...this.eventList];
    this.parentEvent.forEach(v => {
        event = event.concat(v.eventList)
    })
    return event;
  }
  WatchEvent.prototype.add = function(callback) {
    this.eventList.push(callback)
  }
  WatchEvent.prototype.run = function() {
    return this.find()
  }
  
  
  function DataProxy(data, cb, path = [], parentWatchEvent) {
    const current = createData(data);
    let currentWatch = {};
    const watchEvent = new WatchEvent(parentWatchEvent);
    for(let key in current) {
        if(typeof(current[key]) == 'object') {
            current[key] = DataProxy(createData(current[key]), cb, [...path, key], watchEvent)
        }
    }
    const proxy = new Proxy(current, {
        get(target, key) {
            const currentPath = [...path, key]
            return target[key]
        },
        set(target, key, value, receiver) {
            if(key == '__watch') {
                currentWatch[value[0]] = value[1];
                return true;
            }
            if(key == '__watch_deep') {
                watchEvent.add((data) => setTimeout(() => value({...data, path: path, data: target})))
                return true;
            }
            const currentPath = [...path, key];
            if(typeof(value) == 'object') {
                value = DataProxy( createData(value), cb, currentPath, watchEvent )
            }
            if (!(Array.isArray(target) && key === 'length')) {
                const data = {
                    type: 'set',
                    key,
                    data: value,
                    parent: target,
                    path: currentPath
                }
                currentWatch[key] && currentWatch[key](data);
                target[key] = value;
                watchEvent.run().forEach(v => v(data));
                cb && cb(data)
            }
            return Reflect.set(target, key, value, receiver);
        },
        deleteProperty(target, key) {
            const currentPath = [...path, key];
            const data = {
                type: 'delete',
                key,
                data: target[key],
                parent: target,
                path: currentPath
            }
            if(target instanceof Array) {
              target.splice(key, 1)
            } else {
              delete target[key]
            }
            
            currentWatch[key] && currentWatch[key](data);
            watchEvent.run().forEach(v => v(data));
            cb && cb(data)
            return Reflect.deleteProperty(target, key);
        }
    })
    
    return proxy
  }
  
  function watch(target, key, callback) {
    if(typeof(key) == 'function') {
        target.__watch_deep = key;
    } else {
        target.__watch = [key, callback]
    }
    
  }
  return { watch, FormatPath, DataProxy }
}))
