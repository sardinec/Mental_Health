/*
 * @Author: wss
 * @Date: 2019-04-10 14:32:46
 * @LastEditTime: 2019-12-09 15:02:05
 * @LastEditors: wss
 */

const {ccclass, property, menu} = cc._decorator;


enum MOVEMENT {
    horizontal,
    vertical,
    scale,
    scaleX,
    scaleY,
    rotation,
    opacity,
    skewX,
    skewY,
    forward,
    value,
}

enum  WAVE {
    sine,
    triangle,
    sawtooth,
    reverseSawtooth,
    square
}


let _2pi:number  = 2 * Math.PI;
let _pi_2:number  = Math.PI / 2;
let _3pi_2:number = (3 * Math.PI) / 2;

/**
 * 函数运动 [v1.0.0]
 * 以sine 函数曲线 进行周期性运动的插件，可以用在任意循环的效果变动
 * 比如漂浮，摇摆，振荡
 */
@ccclass
@menu("添加特殊行为/Movement/Sine (函数运动)")
export default class BhvSine extends cc.Component {


        @property({tooltip:"在 start 函数时触发"})
        activeAtStart:boolean = true;
      
        @property({
            type:cc.Enum(MOVEMENT),
            tooltip:"以何种属性进行sine周期运动"
        })
        movement:MOVEMENT = MOVEMENT.vertical;

        @property({
            type:cc.Enum(WAVE),
            tooltip:"波形"
        })
        wave:WAVE = WAVE.sine;

        
        @property({tooltip:""})
        period:number =4;
        
        @property({tooltip:"周期随机"})
        periodRandom:number = 0;

        
        @property({tooltip:"周期偏移"})
        periodOffset:number = 0;

        
        @property({tooltip:"周期偏移值 随机"})
        periodOffsetRandom:number = 0;

        
        @property({tooltip:"波动范围"})
        magnitude:number = 50
        
        @property({tooltip:"波动范围随机值"})
        magnitudeRandom:number = 0;


        private i:number;
        private mag:number;
        private initialValue:number;
        private initialValue2:number;
        private lastKnownValue:number;
        private lastKnownValue2:number;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.enabled = this.activeAtStart;
        if (this.period === 0){
            this.i = 0;
        }else{
            this.i = (this.periodOffset / this.period) * _2pi;							
             this.i += ((Math.random() * this.periodOffsetRandom) / this.period) * _2pi;
        }

        this.mag = this.magnitude;													
        this.mag += Math.random() * this.magnitudeRandom;								
        
        this.initialValue = 0;
		this.initialValue2 = 0;
 
        
    }

    start () {
        this.init();
    }

    /**初始化sine 状态 */
    init () {
   
        switch (this.movement) {
            case MOVEMENT.horizontal:
                this.initialValue = this.node.x;
                break;
            case MOVEMENT.vertical:	
                this.initialValue = this.node.y;
                break;
            case MOVEMENT.scale:	
                this.initialValue = this.node.scale;
                break;
            case MOVEMENT.scaleX:	
                this.initialValue = this.node.scaleX;
                break;
            case MOVEMENT.scaleY:		
                this.initialValue = this.node.scaleY;
                break;
            case MOVEMENT.rotation:	
                this.initialValue = -this.node.angle;
                break;
            case MOVEMENT.opacity:		
                this.initialValue = this.node.opacity; //透明度 .opacity
                break;
            case MOVEMENT.skewX:	
                this.initialValue = this.node.skewX;
                break;
            case MOVEMENT.skewY:	
                this.initialValue = this.node.skewY;
                break;
            case MOVEMENT.value:
                //value only, leave at 0
                this.initialValue = 0;
                break;
            case MOVEMENT.forward:		// forwards/backwards
                this.initialValue = this.node.x;
                this.initialValue2 = this.node.y;
                break;
            default:
                cc.warn("Invalid sin movement type");
        }

        this.lastKnownValue = this.initialValue;
		this.lastKnownValue2 = this.initialValue2;
            
    }

    /**设置运动类型*/
    setMovement (m:MOVEMENT) {
        //if (this.movement === MOVE.angle) this.mag = cr.to_degrees(this.mag);
        this.movement = m;
        this.init();
    }

    setPhase (x) {
        this.i = (x * _2pi) % _2pi;
        this.updateFromPhase();
    }

    /**获取sine 产生的值 */
    public value:number = 0;

    private waveFunc(x:number):number{

		x = x % _2pi;
		switch (this.wave) {
		case WAVE.sine:		// sine
			return Math.sin(x);
		case WAVE.triangle:		// triangle
			if (x <= _pi_2)
				return x / _pi_2;
			else if (x <= _3pi_2)
				return 1 - (2 * (x - _pi_2) / Math.PI);
			else
				return (x - _3pi_2) / _pi_2 - 1;
		case WAVE.sawtooth:		// sawtooth
			return 2 * x / _2pi - 1;
		case WAVE.reverseSawtooth:		// reverse sawtooth
			return -2 * x / _2pi + 1;
		case WAVE.square:		// square
			return x < Math.PI ? -1 : 1;
		};
		
		// should not reach here
		return 0;
	}

    update (dt:number) {
		if (!this.enabled  || !this.node.active || dt === 0)
			return;
		
		if (this.period === 0)
			this.i = 0;
		else
		{
			this.i += (dt / this.period) * _2pi;
			this.i = this.i % _2pi;
		}
		
        this.updateFromPhase();
        
    }

    private updateFromPhase () {
        let waveRes = this.waveFunc(this.i) * this.mag;//wave 函数计算结果
        this.value = waveRes;// 保存到 value 值中
        switch (this.movement) {
            case MOVEMENT.horizontal:	
                if (this.node.x !== this.lastKnownValue)
                    this.initialValue += this.node.x - this.lastKnownValue;
                    
                this.node.x = this.initialValue + waveRes;
                this.lastKnownValue = this.node.x;
                break;
            case MOVEMENT.vertical:		
                if (this.node.y !== this.lastKnownValue)
                    this.initialValue += this.node.y - this.lastKnownValue;
                    
                this.node.y = this.initialValue + waveRes;
                this.lastKnownValue = this.node.y;
                break;
            case MOVEMENT.scale:	
                this.node.scale = this.initialValue + waveRes;
                break;
            case MOVEMENT.scaleX:		
                this.node.scaleX = this.initialValue + waveRes;
                break;
            case MOVEMENT.scaleY:		
                this.node.scaleY = this.initialValue + waveRes;
                break;
            case MOVEMENT.rotation:		
                if ((-this.node.angle) !== this.lastKnownValue)
                    this.initialValue = this.initialValue + (-this.node.angle - this.lastKnownValue);
                    
                this.node.angle = -this.initialValue - waveRes;
                this.lastKnownValue = -this.node.angle;
                break;
            case MOVEMENT.opacity:		
                this.node.opacity = this.initialValue + (waveRes);
                
                if (this.node.opacity < 0)
                    this.node.opacity = 0;
                else if (this.node.opacity > 255)
                    this.node.opacity = 255;
                    
                break;
            case MOVEMENT.skewX:		
                this.node.skewX = this.initialValue + waveRes;
                break;
            case MOVEMENT.skewY:		
                this.node.skewY = this.initialValue + waveRes;
                break;
            case MOVEMENT.forward:	//forwards/backwards
                if (this.node.x !== this.lastKnownValue) this.initialValue += this.node.x - this.lastKnownValue;
                if (this.node.y !== this.lastKnownValue2) this.initialValue2 += this.node.y - this.lastKnownValue2;
                    
                this.node.x = this.initialValue + Math.cos(-this.node.angle/360 *_2pi) * waveRes;
                this.node.y = this.initialValue2 + Math.sin(-this.node.angle/360 *_2pi) * waveRes;
                this.lastKnownValue = this.node.x;
                this.lastKnownValue2 = this.node.y;

                break;
            }
    }

    private getCyclePos (){
      return  this.i / _2pi
    }



   
}
