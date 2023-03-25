import { GLOBAL } from "../Global";

/**
 * A helper class to call events(functions) after X ms
 */
export class TimeEvent {
    private callback: () => void;
    private timeoutId: number;
    private isRunning : boolean;
    private ms : number;
    constructor(callback: () => void, ms : number) {
        this.callback = callback;
        this.timeoutId = 0;
        this.isRunning = false;
        this.ms = ms;
    }
    public start()
    {   
        if(!this.isRunning)
        {
            this.isRunning = true;
            this.timeoutId = setTimeout(() => {
                this.callback()
                this.stop()
            }, this.ms);
            //GLOBAL.print("Event:" + this.timeoutId.toString());
        }
      
    }
    public stop()
    {   
        if(this.isRunning)
        {
            this.isRunning = false;
            clearTimeout(this.timeoutId);
        }
    }
    public setCallBack(callback : ()=> void)
    {
        this.callback = callback;
    }
}
