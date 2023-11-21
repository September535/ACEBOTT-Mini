enum SwitchStatus{
    //% block="ON"
    ON = 1,
    //% block="OFF"
    OFF = 0
}

enum AnalogReadPin{
  //% block="P0"
  P0 = 0,
  //% block="P1"
  P1 = 1,
  //% block="P2"
  P2 = 2,
  //% block="P3"
  P3 = 3,
  //% block="P4"
  P4 = 4,
  //% block="P10"
  P10 = 10
}

enum AnalogWritePin{
  //% block="P0"
  P0 = 0,
  //% block="P1"
  P1 = 1,
  //% block="P2"
  P2 = 2,
  //% block="P3"
  P3 = 3,
  //% block="P4"
  P4 = 4,
  //% block="P10"
  P10 = 10
}

enum DigitalWritePin{
  //% block="P0"
  P0 = 0,
  //% block="P1"
  P1 = 1,
  //% block="P2"
  P2 = 2,
  //% block="P5"
  P5 = 5,
  //% block="P8"
  P8 = 8,
  //% block="P9"
  P9 = 9,
  //% block="P11"
  P11 = 11,
  //% block="P12"
  P12 = 12,
  //% block="P13(SCK)"
  P13 = 13,
  //% block="P14(MISO)"
  P14 = 14,
  //% block="P15(MOSI)"
  P15 = 15,
  //% block="P16"
  P16 = 16
}

enum DigitalReadPin{
  //% block="P0"
  P0 = 0,
  //% block="P1"
  P1 = 1,
  //% block="P2"
  P2 = 2,
  //% block="P5"
  P5 = 5,
  //% block="P8"
  P8 = 8,
  //% block="P9"
  P9 = 9,
  //% block="P11"
  P11 = 11,
  //% block="P12"
  P12 = 12,
  //% block="P13(SCK)"
  P13 = 13,
  //% block="P14(MISO)"
  P14 = 14,
  //% block="P15(MOSI)"
  P15 = 15,
  //% block="P16"
  P16 = 16
}

enum DistanceUnit {
  //% block="cm"
  CM = 0,
  //% block="inch"
  INCH = 1
}

enum Servos {
  //% block="Servo1"
  Servo1 = 1,
  //% block="Servo2"
  Servo2 = 2
}

enum RGB_Index{
  //% block="RGB1"
  RGB1 = 1,
  //% block="RGB2"
  RGB2 = 2
}

enum Motors{
  //% block="M1"
  M1 = 0,
  //% block="M2"
  M2 = 1,
  //% block="M3"
  M3 = 2,
  //% block="M4"
  M4 = 3
}

//% icon="icon_1.png"
namespace Acebott{
    const PCA9685_ADDRESS = 0x40
    const MODE1 = 0x00
    const MODE2 = 0x01
    const SUBADR1 = 0x02
    const SUBADR2 = 0x03
    const SUBADR3 = 0x04
    const PRESCALE = 0xFE
    const LED0_ON_L = 0x06

    function getPort(pin_num: number): number {
        return 100 + pin_num
    }

    function getAnalogPin(pin_num: number): AnalogPin {
        return getPort(pin_num)
    }

    function getDigitalPin(pin_num: number): DigitalPin {
        return getPort(pin_num)
    }

    let initialized = false

    function i2cwrite(addr: number, reg: number, value: number) {
        let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(addr, buf)
    }

    function i2ccmd(addr: number, value: number) {
        let buf = pins.createBuffer(1)
        buf[0] = value
        pins.i2cWriteBuffer(addr, buf)
    }

    function i2cread(addr: number, reg: number) {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(addr, NumberFormat.UInt8BE);
        return val;
    }

    function initPCA9685(): void {
        i2cwrite(PCA9685_ADDRESS, MODE1, 0x00)
        setFreq(50);
        for (let idx = 0; idx < 16; idx++) {
            setPwm(idx, 0, 0);
        }
        initialized = true
    }

    function setFreq(freq: number): void {
        // Constrain the frequency
        let prescaleval = 25000000;
        prescaleval /= 4096;
        prescaleval /= freq;
        prescaleval -= 1;
        let prescale = prescaleval; //Math.Floor(prescaleval + 0.5);
        let oldmode = i2cread(PCA9685_ADDRESS, MODE1);
        let newmode = (oldmode & 0x7F) | 0x10; // sleep
        i2cwrite(PCA9685_ADDRESS, MODE1, newmode); // go to sleep
        i2cwrite(PCA9685_ADDRESS, PRESCALE, prescale); // set the prescaler
        i2cwrite(PCA9685_ADDRESS, MODE1, oldmode);
        control.waitMicros(5000);
        i2cwrite(PCA9685_ADDRESS, MODE1, oldmode | 0xa1);
    }

    function setPwm(channel: number, on: number, off: number): void {
        if (channel < 0 || channel > 15)
            return;
        let buf = pins.createBuffer(5);
        buf[0] = LED0_ON_L + 4 * channel;
        buf[1] = on & 0xff;
        buf[2] = (on >> 8) & 0xff;
        buf[3] = off & 0xff;
        buf[4] = (off >> 8) & 0xff;
        pins.i2cWriteBuffer(PCA9685_ADDRESS, buf);
    }

    // LED @start
    //% blockId=setLedBrightness block="LED at %pin| set brightness %v"
    //% weight=70
    //% v.min=0 v.max=100 v.defl=50
    //% subcategory="Display"
    //% group="LED"
    export function setLedBrightness(pin: AnalogWritePin, v: number): void {
        let port = getAnalogPin(pin)
        pins.analogWritePin(port, v*10.23)
    }

    //% blockId=setLed block="LED at %pin| set %status"
    //% weight=70
    //% subcategory="Display"
    //% group="LED"
    export function setLed(pin: DigitalWritePin, status: SwitchStatus): void {
        let port = getDigitalPin(pin)
        pins.digitalWritePin(port, status)
    }
    // LED @end

    /**
    * Servo Execute
    * @param index Servo Channel; eg: S1, S2
    * @param degree [0-180] degree of servo; eg: 0, 90, 180
   */
   //% blockId=Servo block="Servo|%index|degree %degree"
   //% degree.min=0 degree.max=180
   //% group="Servo"
   //% subcategory="Executive"
   export function Servo(index: Servos, degree: number): void {
       if (!initialized) {
           initPCA9685()
       }
       let v_us = (degree * 1800 / 180 + 600)
       let value = v_us * 4096 / 20000
       setPwm(index * 5, 0, value)
   }

    // RGB OnBoard @start
    //% blockId=RGB_OnBoard block="RGB on board |%index|show(R:|%red|G:|%green|B:|%blue|)"
    //% red.min=0 red.max=255
    //% green.min=0 green.max=255
    //% blue.min=0 blue.max=255
    //% group="RGB LED"
    //% subcategory="Display"
    //% inlineInputMode=inline
    export function RGB_OnBoard(index:RGB_Index, red: number, green: number, blue: number): void {
        if (!initialized) {
            initPCA9685()
        }

        switch (index) {
            case 1:
                setPwm(1, 0, red*16)
                setPwm(0, 0, green*16)
                setPwm(2, 0, blue*16)
                break
            case 2:
                setPwm(14, 0, red*16)
                setPwm(13, 0, green*16)
                setPwm(15, 0, blue*16)
                break
        }
    }
    // RGB OnBoard @end

    // DC Motor @start
    const MOTORS_PIN: number[][] = [[4, 3], [12, 11], [7, 6], [9, 8]]
    //% blockId=dc_motor_run block="DC Motor|%index|run speed %speed"
    //% speed.min=-255 speed.max=255
    //% group="DC Motor"
    //% subcategory="Executive"
    export function dc_motor_run(index: Motors, speed: number): void {
        if (!initialized) {
            initPCA9685()
        }
        speed = speed * 16; // map 255 to 4096
        if (speed >= 4096) {
            speed = 4095
        }
        if (speed <= -4096) {
            speed = -4095
        }

        if (speed >= 0) {
            setPwm(MOTORS_PIN[index][0], 0, speed)
            setPwm(MOTORS_PIN[index][1], 0, 0)
        } else {
            setPwm(MOTORS_PIN[index][0], 0, 0)
            setPwm(MOTORS_PIN[index][1], 0, -speed)
        }
    }
    // DC Motor @end

    // 4-Digital Tube @start
    const characterBytes: number[] = [
        0x3F, 0x06, 0x5B, 0x4F, 0x66, 0x6D, 0x7D, 0x07, 0x7F, 0x6F,  /* 0 - 9 */
        0x77, 0x7C, 0x39, 0x5E, 0x79, 0x71, 0x3D, 0x76, 0x06, 0x0E,  /* A - J */
        0x38, 0x54, 0x74, 0x73, 0x67, 0x50, 0x78, 0x1C, 0x40, 0x63,  /* LnoPQrtu-* (degree) */
        0x00]
    const digitAddress: number[] = [0x68, 0x6A, 0x6C, 0x6E]

    class TM1650Class {
        public displayDigitsRaw: number[] = [0, 0, 0, 0]

        constructor(clock: DigitalPin = DigitalPin.P1, data: DigitalPin = DigitalPin.P0) {
            this.reconfigure(clock, data)
        }
        public setSpeed( baud : number = 8333 ) : void {
            /* baud = microseconds per bit, clockLength - clock pulse width */
            let clockLength = 120
            /* Time per bit transmitted is one clock cycle, 2 pulse widths */
            clockLength = 1000000 / baud
            if(clockLength >= 4) {
                this.pulseWidth = Math.floor(clockLength / 2)
                this.halfPulseWidth = Math.floor(clockLength / 4)
            } else {
                this.pulseWidth = 2
                this.halfPulseWidth = 1
            }
        }
        public reconfigure(clock: DigitalPin = DigitalPin.P1, data: DigitalPin = DigitalPin.P0) : void {
            this.clockPin = clock
            this.dataPin = data
            pins.digitalWritePin(this.clockPin, 0)
            pins.digitalWritePin(this.dataPin, 0)
            pins.setPull(this.dataPin, PinPullMode.PullUp)
            pins.digitalWritePin(this.dataPin, 0)
            this.goIdle()
        }
        public displayOn(brightness: number = 0) : void {
            this.goIdle()
            brightness &= 7
            brightness <<= 4
            brightness |= 1
            this.sendPair(0x48, brightness)
        }
        public displayOff() : void {
            this.sendPair(0x48, 0)
        }
        public displayClear() : void {
            for( let i = 0 ; i < 4 ; i++ ) {
                this.sendPair(digitAddress[i], 0)
                this.displayDigitsRaw[i] = 0
            }
        }
        public showSegments(pos: number = 0, pattern: number = 0) : void {
            pos &= 3
            this.displayDigitsRaw[pos] = pattern
            this.sendPair(digitAddress[pos], this.displayDigitsRaw[pos])
        }
        public showChar(pos: number = 0, c: number = 0) : void {
            let charindex = 30
            pos &= 3
            charindex = this.charToIndex(c)
            if (c == 0x2E) {
                this.displayDigitsRaw[pos] |= 128
            } else {
                this.displayDigitsRaw[pos] = characterBytes[charindex]
            }
            this.sendPair(digitAddress[pos], this.displayDigitsRaw[pos])
        }
        public showCharWithPoint(pos: number = 0, c: number = 0) : void {
            let charindex2 = 30
            pos &= 3
            charindex2 = this.charToIndex(c)
            this.displayDigitsRaw[pos] = characterBytes[charindex2] | 128
            this.sendPair(digitAddress[pos], this.displayDigitsRaw[pos])
        }
        public showString(s: string) : void {
            let outc: number[] = []
            let dp: number[] = [0, 0, 0, 0]
            let c = 0
            let index = 0
            let di = 0

            for (index = 0, di = 0; (index < s.length) && (di < 4); index++) {
                c = s.charCodeAt(index)
                if (c == 0x2E) {
                    if (di == 0) {
                        outc[di] = 32
                        dp[di] = 1
                        di++
                    } else {
                        if (dp[di - 1] == 0) {
                            dp[di - 1] = 1
                        } else {
                            dp[di] = 1
                            di++
                            outc[di] = 32
                        }
                    }
                } else {
                    outc[di] = c
                    di++
                }
            }
            for (index = 0; index < di; index++) {
                c = outc[index]
                if (dp[index] == 0) {
                    this.showChar(index, c)
                }
                else {
                    this.showCharWithPoint(index, c)
                }
            }
        }
        public showInteger(n: number = 0) : void {
            let outc2: number[] = [32, 32, 32, 32]
            let i = 3
            let absn = 0

            if ((n > 9999) || (n < -999)) {
                this.showString("Err ")
            } else {
                absn = Math.abs(n)
                if (absn == 0) {
                    outc2[3] = 0x30
                } else {
                    while (absn != 0) {
                        outc2[i] = (absn % 10) + 0x30
                        absn = Math.floor(absn / 10)
                        i = i - 1
                    }
                    if (n < 0) {
                        outc2[i] = 0x2D
                    }
                }
                for (i = 0; i < 4; i++) {
                    this.showChar(i, outc2[i])
                }
            }
        }
        public showHex(n: number = 0) : void {
            let j = 3

            if ((n > 0xFFFF) || (n < -32768)) {
                this.showString("Err ")
            } else {
                for( j = 0 ; j < 3 ; j++ ) {
                    this.displayDigitsRaw[j] = 0
                }
                this.displayDigitsRaw[3] = characterBytes[0]
                if (n < 0) {
                    n = 0x10000 + n
                }
               for( j = 3 ; (n != 0) ; j-- ) {
                    this.displayDigitsRaw[j] = characterBytes[n & 15]
                    n >>= 4
                }
                for (j = 0; j < 4; j++) {
                    this.sendPair(digitAddress[j], this.displayDigitsRaw[j])
                }
            }
        }
        public showDecimal(n: number = 0) : void {
            let s: string = ""
            let targetlen = 4

            if (n > 9999) {
                this.showString("9999")
            }
            else if (n < -999) {
                this.showString("-999")
            }
             else {
                s = n.toString()
                if (s.includes(".")) {
                    targetlen = 5
                }
                while (s.length < targetlen) {
                    s = " " + s
                }
                this.showString(s)
            }
        }
        public toggleDP(pos: number = 0) : void {
            this.displayDigitsRaw[pos] ^= 128
            this.sendPair(digitAddress[pos], this.displayDigitsRaw[pos])
        }
        public digitRaw(pos : number = 0) : number {
            return this.displayDigitsRaw[pos & 3]
        }
        public digitChar(pos: number = 0) : number {
            let raw=this.displayDigitsRaw[pos&3]
            let c = 0
            let found = 0
            let i = 0
            if(raw == 0){
                c = 32
            }
            while( (i < 30) && ( found == 0) ){
                if( characterBytes[i] == raw) {
                    found = 1
                    if(i < 10){
                        c = 0x30 + i
                    } else {
                        if( i < 20 ) {
                            c = 55 + i
                        } else {
                            c = 77
                            if( i > 20 ) {
                                c = c + ( i - 19 )
                                if( i > 25 ){
                                    c = c + 1
                                    if( i == 28 ) {
                                        c = 0x2d
                                    }
                                    if( i == 29 ) {
                                        c = 0x2a
                                    }
                                    if( i == 128 ) {
                                        c = 0x2e
                                    }
                                }
                            }
                        }
                    }
                } else {
                    i++
                }
            }
            return c
        }
        private clockPin: DigitalPin = DigitalPin.P1
        private dataPin: DigitalPin = DigitalPin.P0
        private pulseWidth: number = 120
        private halfPulseWidth: number = 60
        private charToIndex(c: number) {
            let charCode = 30
            if (c < 30) {
                charCode = c
            } else {
                if ((c > 0x2F) && (c < 0x3A)) {
                    charCode = c - 0x30
                } else {
                    if (c > 0x40) {
                        c &= 0xDF    /* uppercase */
                    }
                    if ((c > 0x40) && (c < 0x4B)) {
                        charCode = c - 0x37
                    } else {
                        if (c == 0x4C) {
                            charCode = 20
                        }
                        if ((c >= 0x4E) && (c <= 0x52)) {
                            charCode = 21 + (c - 0x4E)
                        }
                        if (c == 0x54) {
                            charCode = 26
                        }
                        if (c == 0x55) {
                            charCode = 27
                        }
                        if (c == 0x2D) {
                            charCode = 28
                        }
                        if (c == 0x2A) {
                            charCode = 29
                        }
                    }
                }
            }
            return (charCode)
        }
        private sendPair(byte1: number, byte2: number) {
            this.sendStart()
            this.sendByte(byte1)
            this.sendByte(byte2)
            this.goIdle()
        }
        private sendStart() {
            /* Clock and data both start at 1 */
            pins.digitalWritePin(this.dataPin, 0)
            control.waitMicros(this.pulseWidth)
            pins.digitalWritePin(this.clockPin, 0)
        }
        private goIdle() {
            pins.digitalWritePin(this.clockPin, 1)
            control.waitMicros(this.pulseWidth)
            pins.digitalWritePin(this.dataPin, 1)
            control.waitMicros(this.pulseWidth)
        }
        private sendByte(byte: number) {
            /* The idle state has both clock (SCL) and data (SDA) HIGH.     */
            /* In this function, SCL will start and end LOW, SDA unknown    */
            /* Data are clocked out MSB first. 8 bits are clocked out,      */
            /* latched by the display on the falling edge of SCL. A final   */
            /* ninth clock is sent to allow the display to send an ACK bit. */
            let bitMask = 128
            let ackBit = 0      /* Debug only - discarded */

            bitMask = 128
            while (bitMask != 0) {
                control.waitMicros(this.halfPulseWidth)
                if ((byte & bitMask) == 0) {
                    pins.digitalWritePin(this.dataPin, 0)
                } else {
                    pins.digitalWritePin(this.dataPin, 1)
                }
                control.waitMicros(this.halfPulseWidth)
                pins.digitalWritePin(this.clockPin, 1)
                control.waitMicros(this.pulseWidth)
                pins.digitalWritePin(this.clockPin, 0)
                bitMask >>= 1
            }
            /* Clock is now low and we want the ACK bit so this time read SDA */
            ackBit = pins.digitalReadPin(this.dataPin) /* put pin in read mode with pullup */
            control.waitMicros(this.pulseWidth)
            /* Do one clock */
            pins.digitalWritePin(this.clockPin, 1)
            control.waitMicros(this.pulseWidth)
            ackBit = pins.digitalReadPin(this.dataPin) /* read actual ACK bit */
            pins.digitalWritePin(this.clockPin, 0)
            /* Display takes about half a pulse width to release SDA */
            pins.setPull(this.dataPin, PinPullMode.PullUp)
            while (0 == ackBit) {
                ackBit = pins.digitalReadPin(this.dataPin)
            }
            pins.digitalWritePin(this.dataPin, 0)
            control.waitMicros(this.halfPulseWidth)
        }
    }

    let instanceNames: string[] = []
    let instanceCount: number = 0
    let instances: TM1650Class[] = []
    let currentInstanceIndex: number = 0;

    function findInstanceIndex(name: string) {
        let found = 0;
        let i = 0;
        while((found == 0) && ( i < instanceCount )) {
            if (instanceNames[i] == name) {
                found = 1
            } else {
                i++
            }
        }
        return i
    }

   //% blockId=tm1650_displayOff block="4-Digit Tube |named %name| turn off"
   //% name.defl="1"
   //% subcategory="Display"
   //% group="4-Digit Tube"
   export function tm1650_displayOff(name: string = "1") : void {
       let index: number = findInstanceIndex(name)
       instances[index].displayOff()
   }

   //% blockId=tm1650_showString block="4-Digit Tube |named %name| show string|%s"
   //% name.defl="1" s.defl="Ace"
   //% subcategory="Display"
   //% group="4-Digit Tube"
   export function tm1650_showString(name: string = "1", s: string = "Ace") : void {
       let index: number = findInstanceIndex(name)
       instances[index].showString(s)
   }

   //% blockId=tm1650_showDecimal block="4-Digit Tube |named %name|show number|%n"
   //% name.defl="1"
   //% n.min=-999 n.max=9999 n.defl=0
   //% subcategory="Display"
   //% group="4-Digit Tube"
   export function tm1650_showDecimal(name: string = "1", n: number = 0) : void {
       let index: number = findInstanceIndex(name)
       instances[index].showDecimal(n)
   }

   //% blockId=tm1650_configure block="4-Digit Tube |named %name| with CLK %clk|DIO %dio"
   //% name.defl="1" clk.defl=DigitalWritePin.P0 dio.defl=DigitalWritePin.P1
   //% subcategory="Display"
   //% group="4-Digit Tube"
   export function tm1650_configure(name: string = "1", clk:DigitalWritePin, dio:DigitalWritePin) : void {
       let index: number = 0
       let clkPin = getDigitalPin(clk)
       let dioPin = getDigitalPin(dio)
       index = findInstanceIndex(name)
       if (index == instanceCount) {
           instanceNames[index] = name;
           instances[index] = new TM1650Class(clkPin, dioPin)
           currentInstanceIndex = index
           instanceCount++
       } else {
           instances[index].reconfigure(clkPin, dioPin)
           currentInstanceIndex = index
       }
       instances[currentInstanceIndex].displayOn(6)
   }
   // 4-Digital Tube @end

   // LCD1602 @start


  // LCD1602 @end

   // Laser @start
   //% blockId=setLaser block="Laser at %pin| set %status"
    //% weight=70
    //% subcategory="Display"
    //% group="Laser"
   export function setLaser(pin: DigitalWritePin, status: SwitchStatus): void{
    let port = getDigitalPin(pin)
    pins.digitalWritePin(port, status)

   }
   // Laser @end

    //% blockId=Photoresistance block="Photoresistance at %pin get value"
    //% weight=70
    //% group="Photoresistance"
    //% subcategory="Sensor"
    export function Photoresistance(pin: AnalogReadPin): number {
        let port = getAnalogPin(pin)
        return pins.analogReadPin(port)
    }

    //% blockId=Mosisture_Sensor block="Mosisture Sensor at %pin get value"
    //% group="Mosisture Sensor"
    //% subcategory="Sensor"
    export function Mosisture(pin: AnalogReadPin): number {
        let port = getAnalogPin(pin)
        return pins.analogReadPin(port)
    }

    //% blockId=PIR block="PIR Motion at %pin get value"
    //% weight=70
    //% group="PIR Motion"
    //% subcategory="Sensor"
    export function PIRMotion(pin: DigitalPin): number {
        return pins.digitalReadPin(pin)
    }

    //% blockId=Sound_Sensor block="Sound Sensor at %pin get value"
    //% group="Sound Sensor"
    //% subcategory="Sensor"
    export function SoundSensor(pin: AnalogReadPin): number {
      let port = getAnalogPin(pin)
      return pins.analogReadPin(port)
    }

    /**
     *
     * @param _INA  ina eg: AnalogPin.P1
     * @param _INB  inb eg: AnalogPin.P2
     * @param turn
     * @param speed
     */
    //% blockId=actuator_motor_run block="130 DC Motor at IN+ | %_INA | IN- | %_INB | run speed %speed"  group="130 DC Motor"
    //% weight=70
    //% inlineInputMode=inline
    //% speed.min=-255 speed.max=255
    //% _INA.defl=AnalogWritePin.P0
    //% _INB.defl=DigitalWritePin.P1
    //% speed.defl=100
    //% group="130 DC Motor"
    //% subcategory="Executive"
    export function _130_DC_motor_run(_INA: AnalogWritePin, _INB: DigitalWritePin, speed: number): void {
        let pwmPin = getAnalogPin(_INA)
        let dirPin = getDigitalPin(_INB)
        speed = speed * 4; // map 256 to 1024

        if (speed >= 0) {
            pins.digitalWritePin(dirPin, 1)
            pins.analogWritePin(pwmPin, 1020-speed)
        }
        else{
            pins.digitalWritePin(dirPin, 0)
            pins.analogWritePin(pwmPin, -speed)
        }
    }
    // 130 DC Motor @end

    // Ultrasonic Sensor @start
    //% blockId="ultrasonic_distance"
    //% block="Ultrasonic Sensor with Echo|%echo|Trig|%trig|get distance in %unit"
    //% echo.defl=AnalogWritePin.P0
    //% trig.defl=DigitalWritePin.P1
    //% group="Ultrasonic Sensor"
    //% subcategory="Sensor"
    export function UltrasonicDistance(echo: DigitalPin, trig: DigitalWritePin, unit: DistanceUnit): number {
      let trigPin = getDigitalPin(trig)
      // send pulse
      pins.setPull(trigPin, PinPullMode.PullNone)
      pins.digitalWritePin(trigPin, 0)
      control.waitMicros(2)
      pins.digitalWritePin(trigPin, 1)
      control.waitMicros(10)
      pins.digitalWritePin(trigPin, 0)

      // read pulse
      let d = pins.pulseIn(echo, PulseValue.High)
      let distance = d / 58

      if (distance > 500) {
        distance = 500
      }

      switch (unit) {
        case 0:
          return Math.floor(distance)  //cm
          break
        case 1:
          return Math.floor(distance / 254)   //inch
          break
        default:
          return 500
      }
  }
  // Ultrasonic Sensor @end

  // Button Module @start
  //% blockId="isButtonPressed"
  //% block="Button at|%pin|is pressed"
  //% pin.defl=DigitalReadPin.P0
  //% group="Button"
  //% subcategory="Sensor"

  export function isButtonPressed(pin: DigitalReadPin): boolean {
    let port = getDigitalPin(pin)
    return pins.digitalReadPin(port) == 0;
  }
  // Button Module @end

}
