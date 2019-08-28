export default function openSafe (link) {
  var safeWindow = window.open()
  safeWindow.opener = null
  safeWindow.location = link
}
