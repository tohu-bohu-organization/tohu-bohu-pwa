import Interaction from './Interaction'

export default class Rotate extends Interaction {
    vars() {
        this.audios = document.querySelectorAll('.sound-dashboard')
    }

    addClassContainer() {
        this.containerInteraction.classList.add("rotate")
    }

    bindMethods() {}

    displayInteraction(container) {
        const containerRotate = document.createElement("div")
        const cursor = document.createElement("div")
        const marker = document.createElement("div")
        const ticks = document.createElement("div")
        const ctx = this
        let indexStep = 0

        containerRotate.classList.add("container-rotate")
        ticks.classList.add("ticks")
        cursor.setAttribute("id", "knob")
        marker.setAttribute("id", "marker")

        container.appendChild(containerRotate)
        containerRotate.appendChild(cursor)
        containerRotate.appendChild(ticks)
        cursor.appendChild(marker)

        this.params.forEach((parameter) => {
            const param = document.createElement('span')
            param.dataset.btnName = parameter.replace(/\W/g,'_').toLowerCase()
            param.classList.add('tick')
            param.innerHTML = parameter
            ticks.appendChild(param)
        })

        gsap.registerPlugin(Draggable)

        Draggable.create("#knob", {
            type:"rotation",
            liveSnap: true,
            snap(value) {
                    let rotation = Math.round(value, 10)
                    indexStep = Math.round(rotation / 360 * (ctx.params.length))
                    return Math.round((360/ctx.params.length) * indexStep)
            },
            onDragEnd() {
                let index = indexStep % ctx.params.length

                const sound = ctx.audios[Math.floor(Math.random() * ctx.audios.length )]
                sound.play()

                if (index<0) {
                    index = ctx.params.length + index
                }

                ctx.socket.emit('interaction:activated', { 'element' : { name : ctx.title.replace(/\W/g,'_').toLowerCase() }, 'actionMake' : ctx.params[index] }, ctx.socket.id )
                return Math.round((360/ctx.params.length) * indexStep)

            }
        })
    }
}
