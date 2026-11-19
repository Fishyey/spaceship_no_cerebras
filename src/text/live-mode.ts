import { KEY_STORAGE } from "../llm/gemini.ts"

/**
 * Sim plays simulated sources; flight calls the models. The sources are chosen when the page loads, so switching reloads it in the other mode.
 * Launching asks for the Gemini API key, prefilled with the one kept from last time; the dialog's submit button returns "live".
 */
export function bindModeToggle(toggle: HTMLButtonElement, dialog: HTMLDialogElement, isLive: boolean) {
  const form = dialog.querySelector("form")!
  const keyInput = form.elements.namedItem("gemini") as HTMLInputElement
  toggle.setAttribute("aria-pressed", `${isLive}`)
  toggle.querySelector("b")!.textContent = isLive ? "flight" : "sim"

  toggle.addEventListener("click", () => {
    if (isLive) return reloadAs(false)
    keyInput.value = localStorage.getItem(KEY_STORAGE) ?? ""
    dialog.showModal()
  })
  dialog.addEventListener("close", () => {
    const choice = dialog.returnValue
    dialog.returnValue = ""
    if (choice !== "live") return
    localStorage.setItem(KEY_STORAGE, keyInput.value.trim())
    reloadAs(true)
  })
}

function reloadAs(isLive: boolean) {
  const url = new URL(location.href)
  if (isLive) url.searchParams.set("live", "true")
  else url.searchParams.delete("live")
  location.assign(url)
}
