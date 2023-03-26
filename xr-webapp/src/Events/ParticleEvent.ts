import { ParticleSystem, Color4 , Vector3 , Scene , Texture } from "babylonjs";
import { GLOBAL } from "../Global";
import { TimeEvent } from "./TimeEvent";


export class ParticleEvent
{
    private particleSystem: ParticleSystem; 
    private timeEvent : TimeEvent;          // time based event helper

    constructor()
    {
        this.particleSystem = null;
        this.timeEvent = null;
    }

    /**
     * Init the particle event system such as the time event and particle system
     * @param   scene 
     *          the scene to create the particle system in
     */
    init(scene : Scene)
    {
        var particleSystem = new ParticleSystem("particles", 2000, scene);

        particleSystem.particleTexture = new Texture("textures/flare.png", scene);

        // the starting location
        // particleSystem.emitter = new Vector3(5.65, 0.88, 0.2); 
        particleSystem.emitter = new Vector3(5.85, 0.83, -0.33); 
        particleSystem.emitter = particleSystem.emitter.add(new Vector3(0.2, 0.2, 0.27))

        particleSystem.color1 = new Color4(0.7, 0.8, 1.0, 1.0);
        particleSystem.color2 = new Color4(0.2, 0.5, 1.0, 1.0);
        particleSystem.colorDead = new Color4(0, 0, 0.2, 0.0);

        // random variables
        particleSystem.minSize = 0.01;
        particleSystem.maxSize = 0.05;
        particleSystem.minLifeTime = 0.1;
        particleSystem.maxLifeTime = 0.25;

        particleSystem.emitRate = 1000;
        //emitter shape
        particleSystem.createCylinderEmitter(0.1, 0.1, 0, 0);

        //speed
        particleSystem.minEmitPower = 1;
        particleSystem.maxEmitPower = 3;
        particleSystem.updateSpeed = 0.005;
        this.particleSystem = particleSystem;

        // time event helper where the stop callback will be invoked after 3000ms (3s)
        this.timeEvent = new TimeEvent(this.stop.bind(this), 3000);
    }
    /**
     * Stops the event
     */
    stop()
    {
        this.particleSystem.stop();
        //GLOBAL.print("p stop");
    }
    /**
     * Starts the event
     */
    start()
    {
        this.particleSystem.start();
        this.timeEvent.start();
    }
}