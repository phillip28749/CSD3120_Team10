/*!*****************************************************************************
\file	TimeEvent.ts
/*!*****************************************************************************
\brief
	This file contains the TimeEvent class that include functions for setting 
    up a timer.
*******************************************************************************/

import { GLOBAL } from "../Global";

/**
 * A helper class to call events(functions) after X ms
 */
export class TimeEvent {
  private callback: () => void;
  private timeoutId: number;
  private isRunning: boolean;
  private ms: number;
  constructor(callback: () => void, ms: number) {
    this.callback = callback;
    this.timeoutId = 0;
    this.isRunning = false;
    this.ms = ms;
  }

  /**
   * Starts the timer that will eventually trigger the callback function
   *
   * @returns none
   */
  public start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.timeoutId = setTimeout(() => {
        this.callback();
        this.stop();
      }, this.ms);
      //GLOBAL.print("Event:" + this.timeoutId.toString());
    }
  }

  /**
   * Stops the timer and cancels any pending callback
   *
   * @returns none
   */
  public stop() {
    if (this.isRunning) {
      this.isRunning = false;
      clearTimeout(this.timeoutId);
    }
  }

  /**
   * Sets the callback function
   *
   * @param   callback
   *          the call back function to be changed to
   *
   * @returns none
   */
  public setCallBack(callback: () => void) {
    this.callback = callback;
  }

  /**
   * Sets the timeout value in millisecond
   *
   * @param   ms
   *          the timeout value in millisecond
   *
   * @returns none
   */
  public setTimeoutInMS(ms: number) {
    this.stop();
    this.ms = ms;
  }

  /**
   * Sets the timeout value in seconds
   *
   * @param   sec
   *          the timeout value in seconds
   *
   * @returns none
   */
  public setTimeoutInSecond(sec: number) {
    this.stop();
    this.ms = sec * 0.001;
  }
}
