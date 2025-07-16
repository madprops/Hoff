App.ls_tasks = `tasks_v2`

// Program starts here
App.init = () => {
  App.tasks = App.get_local_storage(App.ls_tasks) || []
  App.setup_backup()
  App.setup_mouse()
  App.setup_keyboard()
  App.setup_popups()
  App.show_tasks()
  App.start_update()
  App.update_title()
}

// Focus first input
App.focus_first = () => {
  let el = DOM.els(`.task`)[0]

  if (el) {
    App.focus_input(el)
  }
}

// Put the tasks in the container
App.show_tasks = () => {
  let container = DOM.el(`#tasks`)
  container.innerHTML = ``

  for (let i = App.tasks.length - 1; i >= 0; i--) {
    let task = App.tasks[i]

    if (task) {
      let el = App.create_task_element(task)
      container.append(el)
      App.check_important(task)
    }
  }

  App.check_first()
}

// Create a task's element
App.create_task_element = (task) => {
  let el = DOM.create(`div`, `task`, `task_id_${task.id}`)
  let top = DOM.create(`div`, `task_top`)
  let bottom = DOM.create(`div`, `task_bottom`)

  //
  let info = DOM.create(`div`, `task_info`)
  App.set_info(info, task)
  top.append(info)
  el.append(top)

  //
  let check = DOM.create(`input`, `task_check`)
  check.title = `Mark as done`
  check.type = `checkbox`
  check.checked = task.done

  DOM.ev(check, `change`, () => {
    App.update_date(task)
    App.update_title()
    App.sort_tasks()
    App.reorder_tasks()
    App.save_tasks()
  })

  bottom.append(check)

  //
  let text = DOM.create(`input`, `task_text`)
  text.type = `text`
  text.value = task.text
  text.placeholder = `Write something here`

  DOM.ev(text, `blur`, () => {
    App.on_blur(text)
  })

  DOM.ev(text, `input`, () => {
    App.on_input(text)
  })

  bottom.append(text)

  //
  let remove = DOM.create(`div`, `task_remove action`)
  remove.textContent = `x`
  bottom.append(remove)

  el.append(bottom)
  el.dataset.id = task.id
  task.element = el
  return el
}

// Prepend a task in the container
App.prepend_task = (task) => {
  if (!task) {
    return
  }

  let container = DOM.el(`#tasks`)
  let el = App.create_task_element(task)
  container.prepend(el)
  el.focus()
  App.focus_input(el)
}

// Focus an element's input
App.focus_input = (el) => {
  DOM.el(`.task_text`, el).focus()
}

// Add a new task
App.add_task = (text = ``) => {
  let d = Date.now()
  let s = App.get_random_string(5)
  let id = `${d}_${s}`

  let task = {
    id,
    text,
    date: d,
    done: false,
  }

  App.tasks.push(task)
  App.prepend_task(task)
  App.update_title()
  App.save_tasks()
}

// Get a task by id
App.get_task_by_id = (id) => {
  for (let task of App.tasks) {
    if (id === task.id) {
      return task
    }
  }
}

// Get a task by id
App.get_task_element_by_id = (id) => {
  for (let el of DOM.els(`.task`)) {
    if (id === el.dataset.id) {
      return el
    }
  }
}

// Save tasks to local storage
App.save_tasks = () => {
  App.save_local_storage(App.ls_tasks, App.tasks)
}

// Show remove tasks dialog
App.remove_tasks_dialog = () => {
  let buttons = [
    [`Undo Remove`, () => {
      App.undo_remove()
    }, false],
    [`Remove Done`, () => {
      App.remove_done_tasks()
    }, false],
    [`Remove All`, () => {
      App.remove_all_tasks()
    }, false],
  ]

  App.show_dialog(`Remove Tasks`, buttons)
}

// Remove tasks that are marked as done
App.remove_done_tasks = () => {
  let done = App.get_done_tasks()

  if (done.length > 0) {
    App.backup_tasks()
    App.tasks = App.tasks.filter(x => !x.done)
    App.save_tasks()
    App.show_tasks()
    App.update_title()
  }
}

// Remove all tasks
App.remove_all_tasks = () => {
  if (App.tasks.length > 0) {
    App.backup_tasks()
    App.tasks = []
    App.add_task()
    App.save_tasks()
    App.show_tasks()
    App.update_title()
  }
}

// Get a random int number from a range
App.get_random_int = (min, max, exclude = undefined) => {
  let num = Math.floor(Math.random() * (max - min + 1) + min)

  if (exclude !== undefined) {
    if (num === exclude) {
      if (num + 1 <= max) {
        num = num + 1
      }
      else if (num - 1 >= min) {
        num = num - 1
      }
    }
  }

  return num
}

// Get a random string of a certain length
App.get_random_string = (n) => {
  let text = ``

  let possible = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`

  for (let i = 0; i < n; i++) {
    text += possible[App.get_random_int(0, possible.length - 1)]
  }

  return text
}

// Remove a task
App.remove_task = (el) => {
  App.backup_tasks()
  let id = el.dataset.id
  App.tasks = App.tasks.filter(x => x.id !== id)
  el.remove()
  App.update_title()
  App.save_tasks()
}

// Get tasks that are marked as done
App.get_done_tasks = () => {
  let done = []

  for (let task of App.tasks) {
    if (task.done) {
      done.push(task)
    }
  }

  return done
}

// Show some information
App.show_info = () => {
  let s = ``
  s += `This is a simple TODO list.\n`
  s += `Tasks are saved in local storage.\n`
  s += `No network requests are made.`
  App.show_alert(s)
}

// Clear input or remove task if empty
App.clear_input = () => {
  let input = App.get_focused_input()

  if (input) {
    if (input.value) {
      input.value = ``
    }
    else if (App.tasks.length > 1) {
      App.remove_task(input.closest(`.task`))
      App.focus_first()
    }
  }
}

// Get input that is focused
App.get_focused_input = () => {
  for (let input of DOM.els(`.task_text`)) {
    if (input === document.activeElement) {
      return input
    }
  }
}

// Check if no tasks - Focus first task
// If no task add one - Always at least 1 task
App.check_first = () => {
  if (App.tasks.length === 0) {
    App.add_task(`You can also use the filter`)
    App.add_task(`Meant for shortform keywords`)
    App.add_task(`Add and remove tasks anytime`)
    App.add_task(`Check the buttons above`)
    App.add_task(`Welcome To Hoff`)
  }

  App.focus_first()
}

// Check if first task is empty
App.first_task_empty = () => {
  return App.tasks[0].text === ``
}

// Move up or down to the next input
App.move_input = (direction) => {
  let items = [DOM.el(`#filter`)].concat(DOM.els(`.task_text`))
  let waypoint = false

  if (direction === `up`) {
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
App.check_focus = () => {
  if (!App.input_focused() && !App.filter_focused()) {
    App.focus_first()
  }
}

// On input blur
App.on_blur = (el) => {
  App.update_input(el, true)
}

// On input event
App.do_on_input = (el) => {
  App.update_input(el)
}

// Update input
App.update_input = (el, reflect = false) => {
  let value = el.value.trim()

  if (reflect) {
    el.value = value
  }

  let id = el.closest(`.task`).dataset.id
  let task = App.get_task_by_id(id)

  if (task && (task.text.trim() !== value)) {
    task.text = value
    App.update_date(task)
    let info = DOM.el(`.task_info`, el.closest(`.task`))
    App.set_info(info, task)
    App.check_important(task)
    App.save_tasks()
  }
}

// Check if a task input is focused
App.input_focused = () => {
  return document.activeElement.classList.contains(`task_text`)
}

// Check if filter is focused
App.filter_focused = () => {
  return document.activeElement === DOM.el(`#filter`)
}

// Filter tasks
App.do_filter = () => {
  let value = DOM.el(`#filter`).value.trim().toLowerCase()
  let words = value.split(` `).filter(x => x !== ``)

  for (let task of App.tasks) {
    let el = DOM.el(`#task_id_${task.id}`)
    let text = task.text.toLowerCase()
    let info = DOM.el(`.task_info`, el).textContent.toLowerCase()
    let match = words.every(x => text.includes(x) || info.includes(x))

    if (match) {
      el.classList.remove(`hidden`)
    }
    else {
      el.classList.add(`hidden`)
    }
  }
}

// Clear the filter
App.clear_filter = () => {
  DOM.el(`#filter`).value = ``
  App.do_filter()
}

// Set a task's header info
App.set_info = (el, task) => {
  if (task.text) {
    el.textContent = App.timeago(task.date)
  }
  else {
    el.textContent = `Empty Task`
  }
}

// Toggle done checkbox
App.toggle_check = (e, id) => {
  let check = e.target.closest(`.task_check`)
  let task = App.get_task_by_id(id)
  task.done = check.checked
  App.save_tasks()
}

// Sort tags based on state and date
App.sort_tasks = () => {
  App.tasks.sort((a, b) => {
    if (b.done === a.done) {
      return b.date > a.date ? -1 : 1
    }

    return b.done - a.done
  })
}

// Reorder tasks
App.reorder_tasks = () => {
  let fragment = document.createDocumentFragment()

  for (let task of App.tasks.slice(0).reverse()) {
    fragment.appendChild(task.element)
  }

  DOM.el(`#tasks`).appendChild(fragment)
}

// Setup backup
App.setup_backup = () => {
  App.lock_backup = App.create_debouncer(() => {
    App.backup_locked = false
  }, 1234)
}

// Backup tasks
App.backup_tasks = () => {
  if (App.backup_locked) {
    App.lock_backup()
    return
  }

  App.tasks_backup = App.tasks.slice(0)
  App.backup_locked = true
  App.lock_backup()
}

// Restore tasks from backup
App.undo_remove = () => {
  if (App.tasks_backup) {
    App.tasks = App.tasks_backup.slice(0)
    App.tasks_backup = undefined
    App.save_tasks()
    App.show_tasks()
    App.update_title()
  }
}

App.check_important = (task) => {
  let important = false
  let text = DOM.el(`.task_text`, DOM.el(`#task_id_${task.id}`))

  if (!task.done) {
    if (text.value.trim().endsWith(`!`)) {
      let check = DOM.el(`.task_check`, DOM.el(`#task_id_${task.id}`))

      if (!check.checked) {
        important = true
      }
    }
  }

  if (important) {
    text.classList.add(`important`)
  }
  else {
    text.classList.remove(`important`)
  }
}

App.start_update = () => {
  App.update()

  setInterval(() => {
    App.update()
  }, App.MINUTE)
}

App.update = () => {
  for (let task of App.tasks) {
    let info = DOM.el(`.task_info`, DOM.el(`#task_id_${task.id}`))
    App.set_info(info, task)
  }
}

App.update_title = () => {
  let pending = App.tasks.filter(x => !x.done).length
  document.title = `Hoff - (${pending})`
}

App.update_date = (task) => {
  task.date = Date.now()
  let info = DOM.el(`.task_info`, DOM.el(`#task_id_${task.id}`))
  info.title = App.nice_date(task.date)
}