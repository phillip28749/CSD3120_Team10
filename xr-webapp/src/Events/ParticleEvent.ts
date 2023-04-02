/*!*****************************************************************************
\file	ParticleEvent.ts
/*!*****************************************************************************
\brief
	This file contains the ParticleEvent class that include functions for setting 
    up the particle system.
*******************************************************************************/

import {
  ParticleSystem,
  Color4,
  Scene,
  Texture,
  AbstractMesh,
} from "babylonjs";
import { GLOBAL } from "../Global";
import { TimeEvent } from "./TimeEvent";

export class ParticleEvent {
  particleSystem: ParticleSystem;
  private timeEvent: TimeEvent; // time based event helper

  constructor() {
    this.particleSystem = null;
    this.timeEvent = null;
  }

  /**
   * Init the particle event system such as the time event and particle system
   *
   * @param   scene
   *          the scene to create the particle system in
   *
   * @returns none
   */
  init(scene: Scene, attachMesh: AbstractMesh) {
    var particleSystem = new ParticleSystem("particles", 2000, scene);

    particleSystem.particleTexture = new Texture("textures/flare.png", scene);

    particleSystem.color1 = new Color4(0.7, 0.8, 1.0, 1.0);
    particleSystem.color2 = new Color4(0.2, 0.5, 1.0, 1.0);
    particleSystem.colorDead = new Color4(0, 0, 0.2, 0.0);

    // random variables
    particleSystem.minSize = 0.01;
    particleSystem.maxSize = 0.05;
    particleSystem.minLifeTime = 0.1;
    particleSystem.maxLifeTime = 0.2;

    particleSystem.emitRate = 1000;
    //emitter shape
    particleSystem.createConeEmitter(0.0005, 2.5);

    //speed
    particleSystem.minEmitPower = 1;
    particleSystem.maxEmitPower = 1.5;
    particleSystem.updateSpeed = 0.003;
    this.particleSystem = particleSystem;

    // time event helper where the stop callback will be invoked after 3000ms (3s)
    this.timeEvent = new TimeEvent(this.stop.bind(this), 3000);

    this.particleSystem.emitter = attachMesh;
  }

  /**
   * Stops the particle event
   *
   * @returns none
   */
  stop() {
    this.particleSystem.stop();
    //GLOBAL.print("p stop");
  }

  /**
   * Starts the particle event
   *
   * @returns none
   */
  start() {
    // the starting location
    this.particleSystem.start();
    this.timeEvent.start();
  }

  /**
   * Sets the duration for the particle system to stop
   *
   * @returns none
   */
  setDuration(duration: number) {
    this.timeEvent.setTimeoutInMS(duration);
  }
}
