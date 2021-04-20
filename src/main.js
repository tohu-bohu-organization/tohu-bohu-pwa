import Socket from './scripts/Socket'
import PwaPopUp from './scripts/PwaPopUp'

class App {
    constructor () {
        this.initApp()
        this.initServiceWorker()
    }

    initApp () {
        new Socket()
        new PwaPopUp()
    }

    initServiceWorker () {
        if ("serviceWorker" in navigator && false) { 
            navigator.serviceWorker.register("./serviceWorker.js")
        }
    }
}

new App()
