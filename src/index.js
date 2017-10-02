import '@a/style/index.css'
var $greet = document.getElementById('greet')

class Main {
  constructor (name) {
    this.name = name
  }

  greet () {
    var name = this.name
    var greeting = `Hello, ${name}!`

    console.log(greeting)
    return greeting
  }
}

var m = new Main('Jack')

$greet.innerHTML = m.greet()
