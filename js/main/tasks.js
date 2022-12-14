App.ls_tasks = "tasks_v2"

// Program starts here
App.init = function () {
  App.tasks = App.get_local_storage(App.ls_tasks) || []
  App.setup_backup()
  App.setup_mouse()
  App.setup_keyboard()
  App.setup_popups()
  App.show_tasks()
}

// Focus first input
App.focus_first = function () {
  let el = App.els(".task")[0]
  
  if (el) {
    App.focus_input(el)
  }
}

// Put the tasks in the container
App.show_tasks = function () {
  let container = App.el("#tasks")
  container.innerHTML = ""

  for (let i=App.tasks.length-1; i>=0; i--) {
    let task = App.tasks[i]
    let el = App.create_task_element(task)    
    container.append(el)
  }

  App.check_first()
}

// Create a task's element
App.create_task_element = function (task) {
  let el = App.create("div", "task", `task_id_${task.id}`) 
  let top = App.create("div", "task_top")
  let bottom = App.create("div", "task_bottom")

  //
  let info = App.create("div", "task_info")
  App.set_info(info, task)
  top.append(info)
  el.append(top)
  
  //
  let check = App.create("input", "task_check")
  check.title = "Mark as done"
  check.type = "checkbox"
  check.checked = task.done

  App.ev(check, "change", function () {
    task.date = Date.now()
    App.sort_tasks()
    App.save_tasks()
    App.show_tasks()
  })

  bottom.append(check)

  //
  let move = App.create("div", "task_move")
  move.title = "Move task"
  let move_icon = App.create("object", "icon")
  move_icon.type = "image/svg+xml"
  move_icon.data = "img/move.svg"
  move.draggable = true

  App.ev(move, "dragstart", function (e) {
    App.on_dragstart(e)
  })

  move.append(move_icon)
  bottom.append(move)   
  
  //
  let text = App.create("input", "task_text")
  text.type = "text"
  text.value = task.text
  text.placeholder = "Write something here"

  App.ev(text, "blur", function () {
    App.on_blur(this)
  })

  App.ev(text, "input", function () {
    App.on_input(this)
  })

  bottom.append(text)

  //
  let remove = App.create("div", "task_remove action")
  remove.textContent = "x"
  bottom.append(remove)

  el.append(bottom)
  el.dataset.id = task.id
  return el
}

// Prepend a task in the container
App.prepend_task = function (task) {
  let container = App.el("#tasks")
  let el = App.create_task_element(task)
  container.prepend(el)
  el.focus()
  App.focus_input(el)
}

// Focus an element's input
App.focus_input = function (el) {
  App.el(".task_text", el).focus()
}

// Add a new task
App.add_task = function () {
  let d = Date.now()
  let s = App.get_random_string(5)
  let id = `${d}_${s}`

  let task = {
    id: id,
    text: "",
    date: d,
    done: false,
  }

  App.tasks.push(task)
  App.prepend_task(task)
  App.save_tasks()
}

// Get a task by id
App.get_task_by_id = function (id) {
  for (let task of App.tasks) {
    if (id === task.id) {
      return task
    }
  }
}

// Get a task by id
App.get_task_element_by_id = function (id) {
  for (let el of App.els(".task")) {
    if (id === el.dataset.id) {
      return el
    }
  }
}

// Save tasks to local storage
App.save_tasks = function () {
  App.save_local_storage(App.ls_tasks, App.tasks)
}

// Show remove tasks dialog
App.remove_tasks_dialog = function () {
  let buttons = [
    ["Undo Remove", function () {
      App.undo_remove()
    }, false],    
    ["Remove Done", function (){
      App.remove_done_tasks()
    }, false],
    ["Remove All", function () {
      App.remove_all_tasks()
    }, false],
  ]

  App.show_dialog("Remove Tasks", buttons)
}

// Remove tasks that are marked as done
App.remove_done_tasks = function () {
  let done = App.get_done_tasks()

  if (done.length > 0) {
    App.backup_tasks()
    App.tasks = App.tasks.filter(x => !x.done)
    App.save_tasks()
    App.show_tasks()
  }
}

// Remove all tasks
App.remove_all_tasks = function () {
  if (App.tasks.length > 0) {
    App.backup_tasks()
    App.tasks = []
    App.add_task()
    App.save_tasks()
    App.show_tasks()
  }
}

// Get a random int number from a range
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

// Get a random string of a certain length
App.get_random_string = function (n) {
  let text = ""

  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

  for (let i = 0; i < n; i++) {
    text += possible[App.get_random_int(0, possible.length - 1)]
  }

  return text
}

// Remove a task
App.remove_task = function (el) {
  App.backup_tasks()
  let id = el.dataset.id
  App.tasks = App.tasks.filter(x => x.id !== id)
  el.remove()
  App.save_tasks()
}

// Get tasks that are marked as done
App.get_done_tasks = function () {
  let done = []

  for (let task of App.tasks) {
    if (task.done) {
      done.push(task)
    }
  }

  return done
}

// On dragstart event
App.on_dragstart = function (e) {
  App.drag_y = e.clientY
  App.drag_element = e.target.closest(".task")
  e.dataTransfer.setDragImage(new Image(), 0, 0)
}

// On dragover event
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

// On dragend event
App.on_dragend = function (e) {
  App.reorder_tasks()
}

// Update tasks array based on element order
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

// Show some information
App.show_info = function () {
  let s = ""
  s += "This is a simple TODO list.\n"
  s += "Tasks are saved in local storage.\n"
  s += "No network requests are made."
  App.show_alert(s)
}

// Clear input or remove task if empty
App.clear_input = function () {
  let input = App.get_focused_input()

  if (input) {
    if (input.value) {
      input.value = ""
    } else {
      if (App.tasks.length > 1) {
        App.remove_task(input.closest(".task"))
        App.focus_first()
      }
    }
  }
}

// Get input that is focused
App.get_focused_input = function () {
  for (let input of App.els(".task_text")) {
    if (input === document.activeElement) {
      return input
    }
  }
}

// Check if no tasks - Focus first task
// If no task add one - Always at least 1 task
App.check_first = function () {
  if (App.tasks.length === 0) {
    App.add_task()
  }

  App.focus_first()
}

// Check if first task is empty
App.first_task_empty = function () {
  return App.tasks[0].text === ""
}

// Move up or down to the next input
App.move_input = function (direction) {
  let items = [App.el("#filter")].concat(App.els(".task_text"))
  let waypoint = false

  if (direction === "up") {
    items.reverse()
  }

  for (let input of items) {
    if (waypoint) {
      input.focus()
      return
    }

    if (input === document.activeElement) {
      waypoint = true
    }
  }
}

// If no input focused then focus the first one
App.check_focus = function () {
  if (!App.input_focused() && !App.filter_focused()) {
    App.focus_first()
  }
}

// On input blur
App.on_blur = function (el) {
  App.update_input(el, true)
}

// On input event
App.do_on_input = function (el) {
  App.update_input(el)
}

// Update input
App.update_input = function (el, reflect = false) {
  let value = el.value.trim()

  if (reflect) {
    el.value = value
  }

  let id = el.closest(".task").dataset.id
  let task = App.get_task_by_id(id)
  
  if (task.text.trim() !== value) {
    task.text = value
    task.date = Date.now()
    let info = App.el(".task_info", el.closest(".task"))
    App.set_info(info, task)
    App.save_tasks()
  }
}

// Check if a task input is focused
App.input_focused = function () {
  return document.activeElement.classList.contains("task_text")
}

// Check if filter is focused
App.filter_focused = function () {
  return document.activeElement === App.el("#filter")
}

// Filter tasks
App.do_filter = function () {
  let value = App.el("#filter").value.trim().toLowerCase()
  let words = value.split(" ").filter(x => x !== "")

  for (let task of App.tasks) {
    let el = App.el(`#task_id_${task.id}`)
    let text = task.text.toLowerCase()
    let info = App.el(".task_info", el).textContent.toLowerCase()
    let match = words.every(x => text.includes(x) || info.includes(x))
    
    if (match) {
      el.classList.remove("hidden")
    } else {
      el.classList.add("hidden")
    }
  }
}

// Clear the filter
App.clear_filter = function () {
  App.el("#filter").value = ""
  App.do_filter()
}

// Set a task's header info
App.set_info = function (el, task) {
  if (task.text) {
    el.textContent = App.nice_date(task.date)
  } else {
    el.textContent = "Empty Task"
  }
}

// Toggle done checkbox
App.toggle_check = function (e, id) {
  let check = e.target.closest(".task_check")
  let task = App.get_task_by_id(id)
  task.done = check.checked
  App.save_tasks()
}

// Sort tags based on state and date
App.sort_tasks = function () {
  App.tasks.sort(function (a, b) {
    if (b.done === a.done) {
      return b.date > a.date ? -1 : 1
    } else {
      return b.done - a.done
    }
  })
}

// Setup backup
App.setup_backup = function () {
  App.lock_backup = App.create_debouncer(function () {
    App.backup_locked = false
  }, 1234)
}

// Backup tasks
App.backup_tasks = function () {
  if (App.backup_locked) {
    App.lock_backup()
    return
  }
  
  App.tasks_backup = App.tasks.slice(0)
  App.backup_locked = true
  App.lock_backup()
}

// Restore tasks from backup
App.undo_remove = function () {
  if (App.tasks_backup) {
    App.tasks = App.tasks_backup.slice(0)
    App.tasks_backup = undefined
    App.save_tasks()
    App.show_tasks()
  }
}