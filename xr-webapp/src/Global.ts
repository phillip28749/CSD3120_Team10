/*!*****************************************************************************
\file	GLOBAL.ts
/*!*****************************************************************************
\brief
	This file contains the GLOBAL class that is used among all the other classes
*******************************************************************************/

export class GLOBAL {
  //Used for debugging purposes (e.g. mouse picking, printing logs...)
  static DEBUG_MODE: number = 0; //Set 0 (false) / 1 (true)

  /**
   * Prints the input data to the console if the DEBUG_MODE
   * flag is set to 1
   *
   * @param   data
   *          arguments that are passed in for logging
   *
   * @returns none
   */
  static print(...data: any[]) {
    if (this.DEBUG_MODE) console.log(...data);
  }
}
