// Setup mouse events
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

  App.ev(undo_button, "click", function () {
    App.undo()
  })

  App.ev(info_button, "click", function () {
    App.show_info()
  })

  let container = App.el("#tasks")

  App.ev(container, "click", function (e) {
    if (e.target.closest(".task")) {
      let el = e.target.closest(".task")
      let id = el.dataset.id

      if (e.target.closest(".task_check")) {
        App.toggle_check(e, id)
      } else if (e.target.closest(".task_remove")) {
        App.remove_task(el)
        App.check_first()
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

// Setup keyboard events
App.setup_keyboard = function () {
  App.filter = App.create_debouncer(function () {
    App.do_filter()
  }, 250)

  App.on_input = App.create_debouncer(function (input) {
    App.do_on_input(input)
  }, 500)

  App.ev(document, "keydown", function (e) {
    App.check_focus()

    if (e.key === "Enter") {
      if (App.popup_open) {
        if (App.popup_mode === "dialog") {
          App.dialog_enter()
        }
      } else {
        App.add_task()
      }

      e.preventDefault()
    } 
    
    else if (e.key === "Escape") {
      if (App.popup_open) {
        App.hide_all_popups()
      }

      else if (App.filter_focused()) {
        App.clear_filter()
      } 
      
      else if (App.input_focused()) {
        App.clear_input()
      }

      e.preventDefault()
    } 
    
    else if (e.key === "ArrowUp") {
      App.move_input("up")
      e.preventDefault()
    } 
    
    else if (e.key === "ArrowDown") {
      App.move_input("down")
      e.preventDefault()
    } 

    else if (e.key === "ArrowLeft") {
      if (App.popup_open) {
        App.dialog_left()
        e.preventDefault()
      }
    } 

    else if (e.key === "ArrowRight") {
      if (App.popup_open) {
        App.dialog_right()
        e.preventDefault()
      }
    } 
    
    else if (e.key === "Tab") {
      if (e.shiftKey) {
        App.move_input("up")
      } else {
        App.move_input("down")
      }

      e.preventDefault()
    } else {
      if (App.filter_focused()) {
        App.filter()
      }
    }
  })
}