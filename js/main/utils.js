// Centralized function to create debouncers
App.create_debouncer = (func, delay) => {
  return (() => {
    let timer

    return (...args) => {
      clearTimeout(timer)

      timer = setTimeout(() => {
        func(...args)
      }, delay)
    }
  })()
}

// Add an event listener
App.ev = (element, action, callback, extra) => {
  element.addEventListener(action, callback, extra)
}

// Retrieve an element
App.el = (query, root = document) => {
  return root.querySelector(query)
}

// Retrieve a list of elements
App.els = (query, root = document) => {
  return Array.from(root.querySelectorAll(query))
}

// Create an element
App.create = (type, classes = ``, id = ``) => {
  let el = document.createElement(type)

  if (classes) {
    let classlist = classes.split(` `).filter(x => x != ``)

    for (let cls of classlist) {
      el.classList.add(cls)
    }
  }

  if (id) {
    el.id = id
  }

  return el
}

// Get local storage object
App.get_local_storage = (ls_name) => {
  let obj

  if (localStorage[ls_name]) {
    try {
      obj = JSON.parse(localStorage.getItem(ls_name))
    }
    catch (err) {
      localStorage.removeItem(ls_name)
      obj = null
    }
  }
  else {
    obj = null
  }

  return obj
}

// Save local storage object
App.save_local_storage = (ls_name, obj) => {
  localStorage.setItem(ls_name, JSON.stringify(obj))
}

// Get a nice date string
App.nice_date = (date = Date.now()) => {
  return dateFormat(date, `ddd - dd/mmm/yy - h:MM tt`)
}