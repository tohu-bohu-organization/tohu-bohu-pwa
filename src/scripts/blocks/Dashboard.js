import Block from './Block'
import Bool from './interactions/Bool'
import List from './interactions/List'
import Cursor from './interactions/Cursor'
import Rotate from './interactions/Rotate'

import { gsap } from 'gsap'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'

gsap.registerPlugin(DrawSVGPlugin)

export default class Dashboard extends Block {
    initEls() {
        this.$els = {
            grid: document.querySelector('.js-grid-container'),
            task: document.querySelector('.js-task'),
            score: document.querySelector('.js-score'),
            scoreContainer: document.querySelector('.js-score-container'),
            scoreEnd: document.querySelector('.js-score-end'),
            timer: document.querySelector('.js-timer'),
            timerStart: document.querySelector('.js-timer-start'),
            instructions: document.querySelector('.js-instructions')
        }
        this.cptCursors= 0
        this.tl
    }

    bindMethods() {
        this.displayDashboard = this.displayDashboard.bind(this)
        this.displayTask = this.displayTask.bind(this)
        this.displayScore = this.displayScore.bind(this)
        this.killTimer = this.killTimer.bind(this)
        this.vibrate = this.vibrate.bind(this)
        this.timer = this.timer.bind(this)
    }

    initEvents() {
        window.history.pushState({}, '')
        this.socket.on('dashboard:display', this.displayDashboard)
        this.socket.on('dashboard:display-task', this.displayTask)
        this.socket.on('dashboard:update-score', this.displayScore)
        this.socket.on('dashboard:kill-timer', this.killTimer)
        this.socket.on('dashboard:vibrate', this.vibrate)
        this.socket.on('dashboard:on-timer', this.timer)

    }

    timer() {
        this.$els.timerStart.innerHTML = 3

        setTimeout( () => {
            this.$els.timerStart.innerHTML = 2
        }, 1000)

        setTimeout( () => {
            this.$els.timerStart.innerHTML = 1
        }, 2000)

        setTimeout( () => {
            this.$els.timerStart.innerHTML = 0
        }, 3000)

        setTimeout( () => {
            this.startGame()
        }, 4000)
    }

    startGame() {
        this.$els.grid.classList.remove('grid-container--disable')
        this.$els.scoreContainer.classList.remove('score--disable')
        this.$els.timerStart.classList.add('timer-start--disable')
        this.$els.instructions.classList.add('instructions--disable')
        console.log('par la')
        this.socket.emit('dashboard:start')
    }

    displayDashboard(currentUser, theme) {
        currentUser.dashboard.forEach((interaction) => {
            switch (interaction.type) {
                case 'bool':
                    new Bool(interaction.data.title, this.$els.grid, interaction.position, null, this.socket)
                    break
                case 'simple-list':
                case 'complex-list':
                    new List(interaction.data.title, this.$els.grid, interaction.position, interaction.data.param, this.socket)
                    break
                case 'simple-cursor':
                case 'complex-cursor':
                    this.cptCursors ++
                    new Cursor(interaction.data.title, this.$els.grid, interaction.position, interaction.data.param, this.socket, interaction.orientation, this.cptCursors, interaction.type)
                    break
                case 'rotate':
                    new Rotate(interaction.data.title, this.$els.grid, interaction.position, interaction.data.param, this.socket)
                    break
            }
        })
    }

    displayTask(currentTask, timer) {
        this.$els.task.innerHTML = currentTask
        this.resetTimer(timer)
    }

    resetTimer(timer) {
        let shapes = "rect"

        this.tl = gsap.timeline({repeat:0})
        this.tl.from(shapes, { drawSVG:"0% 0%", duration: timer/1000})
    }

    displayScore(score) {
        this.$els.score.style.transform = 'scaleX(' + score * 0.1 + ')'
        this.$els.scoreEnd.style.width = score * 10 + '%'
    }

    vibrate() {
        window.navigator.vibrate(30)
    }

    killTimer() {
        this.$els.timer.style.strokeDashoffset = 0
        if(this.tl) {
            this.tl.kill()
        }
    }

    destroy() {
        this.socket.removeListener('dashboard:display')
        this.socket.removeListener('dashboard:display-task')
        this.socket.removeListener('dashboard:update-score')
        this.socket.removeListener('dashboard:kill-timer')
        this.socket.removeListener('dashboard:vibrate')
        this.socket.removeListener('dashboard:on-timer')
        this.$els.timer.style.strokeDashoffset = 0
        if(this.tl) {
            this.tl.kill()
        }
    }
}
