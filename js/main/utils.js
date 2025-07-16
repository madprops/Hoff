App.SECOND = 1000
App.MINUTE = 60 * App.SECOND
App.HOUR = 60 * App.MINUTE
App.DAY = 24 * App.HOUR
App.MONTH = 30 * App.DAY
App.YEAR = 365 * App.DAY

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

// Print to the console
App.info = (s) => {
  // eslint-disable-next-line no-console
  console.info(s)
}

// Get a timeago string
App.timeago = (date) => {
  let diff = Date.now() - date
  let decimals = true

  let n = 0
  let m = ``

  if (diff < App.MINUTE) {
    n = diff / App.SECOND
    m = [`second`, `seconds`]
    decimals = false
  }
  else if (diff < App.HOUR) {
    n = diff / App.MINUTE
    m = [`minute`, `minutes`]
    decimals = false
  }
  else if ((diff >= App.HOUR) && (diff < App.DAY)) {
    n = diff / App.HOUR
    m = [`hour`, `hours`]
  }
  else if ((diff >= App.DAY) && (diff < App.MONTH)) {
    n = diff / App.DAY
    m = [`day`, `days`]
  }
  else if ((diff >= App.MONTH) && (diff < App.YEAR)) {
    n = diff / App.MONTH
    m = [`month`, `months`]
  }
  else if (diff >= App.YEAR) {
    n = diff / App.YEAR
    m = [`year`, `years`]
  }

  if (decimals) {
    n = App.round(n, 1)
  }
  else {
    n = Math.round(n)
  }

  let w = App.plural(n, m[0], m[1])

  if ((n === 0) && (w === `seconds`)) {
    return `Just Now`
  }

  return `${n} ${w} ago`
}

App.round = (n, decimals) => {
  return Math.round(n * (10 ** decimals)) / (10 ** decimals)
}

App.plural = (n, singular, plural) => {
  if (n === 1) {
    return singular
  }

  return plural
}