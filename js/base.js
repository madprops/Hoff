const App = {}
App.ls_tasks = "tasks_v2"

App.init = function () {
  App.tasks = App.get_local_storage(App.ls_tasks) || []
  App.show_tasks()
  App.focus_input()
  App.setup_mouse()
  App.setup_keyboard()
}

App.get_local_storage = function (ls_name) {
  let obj

  if (localStorage[ls_name]) {
    try {
      obj = JSON.parse(localStorage.getItem(ls_name))
    } catch (err) {
      localStorage.removeItem(ls_name)
      obj = null
    }
  } else {
    obj = null
  }

  return obj
}

App.save_local_storage = function (ls_name, obj) {
  localStorage.setItem(ls_name, JSON.stringify(obj))
}

App.show_tasks = function () {
  let container = App.el("#tasks")
  container.innerHTML = ""

  for (let i=App.tasks.length-1; i>=0; i--) {
    let task = App.tasks[i]
    let el = App.create_task_element(task)    
    container.append(el)
  }
}

App.create_task_element = function (task) {
  let el = App.create("div", "task")

  //
  let move = App.create("div", "task_move")
  move.title = "Move task vertically"
  let move_icon = App.create("object", "icon")
  move_icon.type = "image/svg+xml"
  move_icon.data = "img/move.svg"
  move.draggable = true

  App.ev(move, "dragstart", function (e) {
    App.on_dragstart(e)
  })

  move.append(move_icon)
  el.append(move)  
    
  //
  let check = App.create("input", "task_check")
  check.type = "checkbox"
  check.checked = task.done
  el.append(check)
  
  //
  let text = App.create("input", "task_text")
  text.type = "text"
  text.value = task.text

  App.ev(text, "blur", function () {
    let value = this.value.trim()
    this.value = value
    let tsk = App.get_task(task.id)

    if (tsk.text !== value) {
      tsk.text = value
      App.save_tasks()
    }
  })

  el.append(text)

  //
  let remove = App.create("div", "task_remove")
  remove.title = "Remove task"
  let remove_icon = App.create("object", "icon")
  remove_icon.type = "image/svg+xml"
  remove_icon.data = "img/remove.svg"
  remove.append(remove_icon)
  el.append(remove)

  el.dataset.id = task.id
  return el
}

App.el = function (query, root = document) {
  return root.querySelector(query)
}

App.els = function (query, root = document) {
  return Array.from(root.querySelectorAll(query))
}

App.create = function (type, classes = "", id = "") {
  let el = document.createElement(type)

  if (classes) {
    let classlist = classes.split(" ").filter(x => x != "")
  
    for (let cls of classlist) {
      el.classList.add(cls)
    }
  }

  if (id) {
    el.id = id
  }

  return el
}

App.ev = function (element, action, callback, extra) {
  element.addEventListener(action, callback, extra)
}

App.setup_mouse = function () {
  let add_button = App.el("#add_button")

  App.ev(add_button, "click", function () {
    App.add_task()
  })

  let remove_done_button = App.el("#remove_done_button")

  App.ev(remove_done_button, "click", function () {
    App.remove_done_tasks()
  })

  let remove_all_button = App.el("#remove_all_button")

  App.ev(remove_all_button, "click", function () {
    App.remove_all_tasks()
  })

  let container = App.el("#tasks")

  App.ev(container, "click", function (e) {
    if (e.target.closest(".task")) {
      let el = e.target.closest(".task")
      let id = el.dataset.id

      if (e.target.closest(".task_check")) {
        let check = e.target.closest(".task_check")
        let task = App.get_task(id)
        task.done = check.checked
        App.save_tasks()
      } else if (e.target.closest(".task_remove")) {
        el.remove()
        App.remove_task(id)
      }
    }
  })

  let main = App.el("#main")

  App.ev(main, "dragover", function (e) {
    App.on_dragover(e)
    e.preventDefault()
    return false
  })

  App.ev(main, "dragend", function (e) {
    App.on_dragend(e)
  })
}

App.setup_keyboard = function () {
  App.ev(document, "keydown", function (e) {
    let input = App.el("#input")
    let active = document.activeElement
    
    if (active.tagName.toLowerCase() !== "input") {
      App.focus_input()
    }

    if (e.key === "Enter") {
      if (active === input) {
        App.add_task()
      }
    }
  })
}

App.prepend_task = function (task) {
  let container = App.el("#tasks")
  let el = App.create_task_element(task)
  container.prepend(el)
}

App.focus_input = function () {
  App.el("#input").focus()
}

App.add_task = function () {
  let value = input.value.trim()
  input.value = ""
  App.focus_input()

  let d = Date.now()
  let s = App.get_random_string(5)
  let id = `${d}_${s}`

  let task = {
    id: id,
    text: value,
    date: d,
    done: false,
  }

  App.tasks.push(task)
  App.prepend_task(task)
  App.save_tasks()
}

App.get_task = function (id) {
  for (let task of App.tasks) {
    if (id === task.id) {
      return task
    }
  }
}

App.save_tasks = function () {
  App.save_local_storage(App.ls_tasks, App.tasks)
}

App.remove_done_tasks = function () {
  let done = App.get_done_tasks()

  if (done.length > 0) {
    if (confirm(`Remove done tasks? (${done.length})`)) {
      App.tasks = App.tasks.filter(x => !x.done)
      App.save_tasks()
      App.show_tasks()
    }
  }
}

App.remove_all_tasks = function () {
  if (App.tasks.length > 0) {
    if (confirm(`Remove all tasks? (${App.tasks.length})`)) {
      App.tasks = []
      App.save_tasks()
      App.show_tasks()
    }
  }
}

App.get_random_int = function (min, max, exclude = undefined) {
  let num = Math.floor(Math.random() * (max - min + 1) + min)

  if (exclude !== undefined) {
    if (num === exclude) {
      if (num + 1 <= max) {
        num = num + 1
      } else if (num - 1 >= min) {
        num = num - 1
      }
    }
  }

  return num
}

App.get_random_string = function (n) {
  let text = ""

  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

  for (let i = 0; i < n; i++) {
    text += possible[App.get_random_int(0, possible.length - 1)]
  }

  return text
}

App.remove_task = function (id) {
  App.tasks = App.tasks.filter(x => x.id !== id)
  App.save_tasks()
}

App.get_done_tasks = function () {
  let done = []

  for (let task of App.tasks) {
    if (task.done) {
      done.push(task)
    }
  }

  return done
}

App.on_dragstart = function (e) {
  App.drag_y = e.clientY
  App.drag_element = e.target.closest(".task")
  e.dataTransfer.setDragImage(new Image(), 0, 0)
}

App.on_dragover = function (e) {
  if (!e.target.closest(".task")) {
    return
  }

  let direction = e.clientY > App.drag_y ? "down" : "up"
  let el = e.target.closest(".task")

  if (el === App.drag_element) {
    e.preventDefault()
    return false
  }
  
  App.drag_y = e.clientY

  if (direction === "down") {
    el.after(App.drag_element)
  } else {
    el.before(App.drag_element)
  }
}

App.on_dragend = function (e) {
  App.reorder_tasks()
}

App.reorder_tasks = function () {
  let ids = []
  let els = App.els(".task")
  els.reverse()

  for (let el of els) {
    ids.push(el.dataset.id)
  }

  App.tasks.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))
  App.save_tasks()
}