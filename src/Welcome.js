class Welcome {
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

export default Welcome