import Block from './Block'
import Bool from './interactions/Bool'
import List from './interactions/List'
import Cursor from './interactions/Cursor'
import Rotate from './interactions/Rotate'

import { gsap } from 'gsap'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'

gsap.registerPlugin(DrawSVGPlugin)
gsap.registerPlugin(MorphSVGPlugin)

export default class Dashboard extends Block {
    initEls() {
        this.$els = {
            grid: document.querySelector('.js-grid-container'),
            task: document.querySelector('.js-task'),
            scoreCursor: document.querySelector('.js-score-cursor'),
            scoreEnd: document.querySelector('.js-score-end'),
            timer:  document.querySelector('.js-timer'),
            level: document.querySelector('.js-level'),
            oneStep:  document.getElementById('one'),
            timerStart: document.querySelector('.js-timer-start'),
            instructions: document.querySelector('.js-instructions'),
            scoreContainer: document.querySelector('.js-score-container'),
            taskContainer: document.querySelector('.js-task-container'),
            soundTimer: document.querySelector('.sound-timer'),
            skip: document.querySelector('.js-skip'),
        }
        this.cptCursors= 0
        this.tl
        this.score = 5
        this.scoreFront = 5
        this.scoreOnAnim = false
        this.colors = ['#ff7384', '#fe8396', '#fe94a8', '#fda4b9', '#fdb5cb', '#fcc5dd', '#dccce1', '#bcd3e5', '#9cdbe9', '#7ce2ed', '#5ce9f1']
        this.timerRun = false
    }

    bindMethods() {
        this.displayDashboard = this.displayDashboard.bind(this)
        this.displayTask = this.displayTask.bind(this)
        this.displayLevel = this.displayLevel.bind(this)
        this.displayScore = this.displayScore.bind(this)
        this.killTimer = this.killTimer.bind(this)
        this.vibrate = this.vibrate.bind(this)
        this.timer = this.timer.bind(this)
        this.configTimeline = this.configTimeline.bind(this)
        this.skipGame = this.skipGame.bind(this)
    }

    initEvents() {
        window.history.pushState({}, '')
        this.socket.once('dashboard:display', this.displayDashboard)
        this.socket.on('dashboard:display-task', this.displayTask)
        this.socket.on('dashboard:update-score', this.displayScore)
        this.socket.on('dashboard:kill-timer', this.killTimer)
        this.socket.on('dashboard:vibrate', this.vibrate)
        this.socket.once('dashboard:on-timer', this.timer)
        this.socket.once('dashboard:display-level', this.displayLevel)
        this.$els.skip.addEventListener('click', this.skipGame)

        setTimeout(this.timer, 1500)
    }

    skipGame() {
        this.socket.emit('dashboard:skip-game')
    }

    displayLevel(level) {
        this.$els.level.innerHTML = "Niveau " + level
    }

    timer() {
        if(!this.timerRun) {
            this.timerRun = true

            this.$els.soundTimer.play()
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
    }

    startGame() {
        this.$els.grid.classList.remove('grid-container--disable')
        this.$els.scoreContainer.classList.remove('score--disable')
        this.$els.timerStart.classList.add('timer-start--disable')
        this.$els.instructions.classList.add('instructions--disable')
        this.socket.emit('dashboard:start')
    }

    displayDashboard(currentUser) {
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
        let shapes = this.$els.timer
        let container = this.$els.taskContainer

        this.tl = gsap.timeline({repeat:0})
        this.tl
            .to(container, {
                backgroundColor : '#6500FF',
                duration: 0.2,
                ease: 'power.inOut'
            })
            .from(shapes, {
                drawSVG: "0% 0%",
                duration: timer/1000
            }, '-=0.2')
            .to(container, {
                backgroundColor : '#FE6A7A',
                duration: 3,
                ease: 'power.inOut'
            }, `-=${timer/1800}`)
    }

    configTimeline() {

        if(this.scoreUpgrade) {
            this.scoreFront ++
        } else {
            this.scoreFront --
        }

        if(this.score !== this.scoreFront) {
            this.animScore()
        }

        this.scoreOnAnim = false
    }

    displayScore(score) {

        this.score = score

        if(!this.scoreOnAnim && this.score !== this.scoreFront) {
            this.animScore()
        }

    }

    animScore() {

        this.scoreOnAnim = true
        this.scoreUpgrade = true

        if (this.score < this.scoreFront) {
            this.scoreUpgrade = false
        }

        MorphSVGPlugin.convertToPath("circle, polygon, ellipse")

        const ctx = this
        const tlCounter  = gsap.timeline({
            onComplete: ctx.configTimeline
        })

        let delta = -1
        let rotate = 180
        if (this.scoreUpgrade) {
            delta = 1
            rotate = 0
        }

        this.currentColor = this.colors[this.scoreFront]
        this.nextColor = this.colors[this.scoreFront + delta]

        tlCounter
            .set(this.$els.oneStep, {
                rotate,
                transformOrigin:"50% 50%"
            })
            .to(this.$els.oneStep, {fill: this.currentColor, duration: 0.2, morphSVG:"#one"})
            .to(this.$els.oneStep, {fill: this.currentColor, duration: 0.2, morphSVG:"#two"})
            .to(this.$els.oneStep, {fill: this.currentColor, duration: 0.2, morphSVG:"#five"})
            .to(this.$els.oneStep, {fill: this.nextColor, duration: 0.2, morphSVG:"#seven"})
            .to(this.$els.oneStep, {fill: this.nextColor, duration: 0.2, morphSVG:"#nine"})
            .to(this.$els.scoreCursor, {
                x:  29.5 * (this.scoreFront + delta - 5),
                duration: 1,
                ease: 'power4.inOut'
            }, '-=1')
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
        this.$els.skip.removeEventListener('click', this.skipGame)
        this.$els.timer.style.strokeDashoffset = 0
        if(this.tl) {
            this.tl.kill()
        }
    }
}
