import { GamepadManager, Xbox360Pad, DualShockPad, GenericPad, PoseEnabledController, Xbox360Button , DualShockButton , DualShockDpad , EventState, StickValues } from "babylonjs";
import { StackPanel,TextBlock,AdvancedDynamicTexture } from "babylonjs-gui";


export enum Type 
{
    Left,Right, // only for triggers and stick event
    Up,Down     // only for button events
}
/**
 * Gamepad Controller class to support game controllers
 */
export class Controller 
{
    gamepagMg : GamepadManager;
    //event such as button/dpad/trigger callbacks for each type of controllers
    xboxBtnEventCB: (button : Xbox360Button, state : EventState , type : Type) => void
    xboxTriggerEventCB: (value : number , type : Type ) => void
    xboxStickEventCB:(value : StickValues , type : Type ) => void

    dsBtnEventCB: (button : DualShockButton, state : EventState , type : Type) => void
    dsTriggerEventCB:(value : number ,triggerType : Type) => void
    dsStickEventCB:(value : number , triggerType : Type) => void

    constructor()
    {
        //Create gamepad to handle controller connect/disconnect
        this.gamepagMg = new GamepadManager();
    }


    Init()
    {
        //currently only support the 2 types of most common game controllers

        var advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        var stackPanel = new StackPanel();    
        stackPanel.isVertical = true;
        stackPanel.color = "white";
        advancedTexture.addControl(stackPanel);

        let connectionText = new TextBlock("connection", "");
        connectionText.height = "30px";
        stackPanel.addControl(connectionText);
        let buttonsText = new TextBlock("buttons", "");
        buttonsText.height = "30px";
        stackPanel.addControl(buttonsText);
        let triggerText = new TextBlock("trigger", "");
        triggerText.height = "30px";
        stackPanel.addControl(triggerText);
        let stickText = new TextBlock("stick", "");
        stickText.height = "30px";
        stackPanel.addControl(stickText);

        var gamepadManager = this.gamepagMg 
        gamepadManager.onGamepadConnectedObservable.add((gamepad, state)=>{
            
            //Handle gamepad types
            if (gamepad instanceof Xbox360Pad) {
                //Xbox button down/up events
                gamepad.onButtonDownObservable.add((button, state)=>{
                    buttonsText.text = Xbox360Button[button] + " pressed";
                    this.xboxBtnEventCB(button,state,Type.Down);
                })
                gamepad.onButtonUpObservable.add((button, state)=>{
                    buttonsText.text = Xbox360Button[button] + " released";
                    this.xboxBtnEventCB(button,state,Type.Up);
                })
                
                gamepad.onlefttriggerchanged((value)=>{
                    triggerText.text = "Trigger:" + value;
                    this.xboxTriggerEventCB(value,Type.Left);
                })

                gamepad.onrighttriggerchanged((value)=>{
                    triggerText.text = "Trigger:" + value;
                    this.xboxTriggerEventCB(value,Type.Right);
                })

                 //Stick events
                gamepad.onleftstickchanged((values)=>{
                    stickText.text = "x:" + values.x.toFixed(3) + " y:" + values.y.toFixed(3);
                    this.xboxStickEventCB(values,Type.Left);

                });
                gamepad.onrightstickchanged((values)=>{
                    stickText.text = "x:" + values.x.toFixed(3) + " y:" + values.y.toFixed(3);
                    this.xboxStickEventCB(values,Type.Right);

                });
            } 
            else if (gamepad instanceof DualShockPad) {
                //Dual shock button down/up events
                gamepad.onButtonDownObservable.add((button, state)=>{
                    buttonsText.text = DualShockButton[button] + " pressed";
                })
                gamepad.onButtonUpObservable.add((button, state)=>{
                    buttonsText.text = DualShockButton[button] + " released";
                })

                //Stick events
                gamepad.onleftstickchanged((values)=>{
                    stickText.text = "x:" + values.x.toFixed(3) + " y:" + values.y.toFixed(3);
                });
                gamepad.onrightstickchanged((values)=>{
                    stickText.text = "x:" + values.x.toFixed(3) + " y:" + values.y.toFixed(3);
                });

                //Triggers events
                gamepad.onlefttriggerchanged((value)=>{
                    triggerText.text = "Trigger:" + value;
                })

                //DPad events
                gamepad.onPadDownObservable.add((button, state)=>{
                    buttonsText.text = DualShockDpad[button] + " pressed";
                })
                gamepad.onPadUpObservable.add((button, state)=>{
                    buttonsText.text = DualShockDpad[button] + " released";
                })
            } 
          
        })

        gamepadManager.onGamepadDisconnectedObservable.add((gamepad, state)=>{
        })
    }
}