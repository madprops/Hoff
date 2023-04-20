// Get a template
App.get_template = (id) => {
  let template = App.el(`#template_${id}`)

  if (template) {
    return template.innerHTML.trim()
  }
}

// Create a popup
App.create_popup = (args) => {
  let p = {}
  p.setup = false

  let popup = App.create(`div`, `popup_main`, `popup_${args.id}`)
  let container = App.create(`div`, `popup_container`, `popup_container_${args.id}`)
  container.innerHTML = App.get_template(args.id)
  popup.append(container)

  App.ev(popup, `click`, (e) => {
    if (e.target.isConnected && !e.target.closest(`.popup_container`)) {
      App.popups[args.id].hide()
    }
  })

  App.el(`#main`).append(popup)
  p.element = popup

  p.show = () => {
    if (args.setup && !p.setup) {
      args.setup()
      p.setup = true
      console.info(`${args.id} popup setup`)
    }

    p.element.style.display = `flex`
    App.popup_mode = args.id
    App.popup_open = true
  }

  p.hide = () => {
    p.element.style.display = `none`
    App.popup_open = false
  }

  App.popups[args.id] = p
}

// Show popup
App.show_popup = (id) => {
  App.popups[id].show()
}

// Hide popup
App.hide_popup = (id) => {
  App.popups[id].hide()
}

// Hide all popups
App.hide_all_popups = () => {
  for (let key in App.popups) {
    App.popups[key].hide()
  }
}

// Setup popups
App.setup_popups = () => {
  App.popups = {}

  App.create_popup({
    id: `alert`
  })

  App.create_popup({
    id: `dialog`
  })
}

// Show alert
App.show_alert = (message) => {
  App.el(`#alert_message`).textContent = message
  App.show_popup(`alert`)
}

// Show dialog with a list of buttons
App.show_dialog = (message, buttons) => {
  App.el(`#dialog_message`).textContent = message
  let btns = App.el(`#dialog_buttons`)
  btns.innerHTML = ``

  for (let button of buttons) {
    let btn = App.create(`div`, `button`)
    btn.textContent = button[0]

    App.ev(btn, `click`, () => {
      App.hide_popup(`dialog`)
      button[1]()
    })

    if (button[2]) {
      btn.classList.add(`button_2`)
    }

    btns.append(btn)
    button.element = btn
  }

  App.dialog_buttons = buttons
  App.show_popup(`dialog`)
}